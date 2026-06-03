using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Domain.Events;
using ITM.Emprendimientos.Domain.Interfaces;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using ITM.Emprendimientos.Domain.Observers;

namespace ITM.Emprendimientos.Application.Services;

public class ProductoService
{
    private readonly IProductoRepository _productoRepo;
    private readonly IFotosService _fotosService;
    private readonly IEnumerable<IObservadorProducto> _observadores;

    public ProductoService(
        IProductoRepository productoRepo,
        IFotosService fotosService,
        IEnumerable<IObservadorProducto> observadores)
    {
        _productoRepo = productoRepo;
        _fotosService = fotosService;
        _observadores = observadores;
    }

    public async Task ActualizarAsync(
        Guid id,
        ActualizarProductoRequest request,
        Guid emprendedorId)
    {
        var producto = await _productoRepo.ObtenerConDetalleAsync(id)
            ?? throw new KeyNotFoundException($"Producto con Id '{id}' no encontrado.");

        if (producto.EmprendedorId != emprendedorId)
            throw new UnauthorizedAccessException("No tienes permiso para editar este producto.");

        if (producto.AdminDisabled)
            throw new InvalidOperationException(
                "Este producto fue deshabilitado por el administrador y no puede editarse.");

        if (request.Imagen is not null)
        {
            if (!string.IsNullOrWhiteSpace(producto.ImagenUrl))
                await _fotosService.EliminarFotoAsync(producto.ImagenUrl);

            using var stream = request.Imagen.OpenReadStream();
            producto.ImagenUrl = await _fotosService.SubirFotoAsync(
                stream, request.Imagen.FileName, request.Imagen.ContentType);
        }

        producto.Nombre = request.Nombre;
        producto.Descripcion = request.Descripcion;
        producto.Precio = request.Precio;
        producto.CategoriaId = request.CategoriaId;

        await _productoRepo.ActualizarAsync(producto);
    }

    public async Task CambiarEstadoAsync(
        Guid id,
        CambiarEstadoRequest request,
        string responsableEmail,
        bool esAdmin = false)
    {
        var producto = await _productoRepo.ObtenerConDetalleAsync(id)
            ?? throw new KeyNotFoundException($"Producto con Id '{id}' no encontrado.");
        var estadoAnterior = producto.ObtenerNombreEstado();

        switch (request.Accion.ToLower())
        {
            case "activar": producto.Activar(); break;
            case "ocultar":
                if (esAdmin) producto.AdminDisabled = true;
                producto.Ocultar();
                break;
            case "eliminar": producto.Eliminar(); break;
            default: throw new ArgumentException($"Acción inválida: {request.Accion}");
        }

        await _productoRepo.ActualizarAsync(producto);

        var evento = new ProductoEstadoCambiadoEvent(
            ProductoId: producto.Id,
            NombreProducto: producto.Nombre,
            EstadoAnterior: estadoAnterior,
            NuevoEstado: producto.ObtenerNombreEstado(),
            ResponsableEmail: responsableEmail,
            Motivo: request.Motivo,
            OcurridoEn: DateTime.UtcNow);

        foreach (var obs in _observadores)
            await obs.OnProductoCambiadoAsync(evento);
    }
}