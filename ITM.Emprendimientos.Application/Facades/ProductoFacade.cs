using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;

namespace ITM.Emprendimientos.Application.Facades;

public class ProductoFacade
{
    private readonly IProductoRepository _productoRepo;
    private readonly ICategoriaRepository _categoriaRepo;
    private readonly IFotosService _fotosService;
    private readonly IMapper _mapper;

    public ProductoFacade(
        IProductoRepository productoRepo,
        ICategoriaRepository categoriaRepo,
        IFotosService fotosService,
        IMapper mapper)
    {
        _productoRepo = productoRepo;
        _categoriaRepo = categoriaRepo;
        _fotosService = fotosService;
        _mapper = mapper;
    }

    public async Task<ProductoResponse> CrearProductoAsync(
        CrearProductoRequest request,
        Guid emprendedorId)
    {
        _ = await _categoriaRepo.ObtenerPorIdAsync(request.CategoriaId)
            ?? throw new KeyNotFoundException(
                   $"Categoría con Id '{request.CategoriaId}' no encontrada.");

        string? imagenUrl = null;
        if (request.Imagen is not null)
        {
            using var stream = request.Imagen.OpenReadStream();
            imagenUrl = await _fotosService.SubirFotoAsync(
                stream, request.Imagen.FileName, request.Imagen.ContentType);
        }

        var producto = new Producto
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            Precio = request.Precio,
            ImagenUrl = imagenUrl,
            CategoriaId = request.CategoriaId,
            EmprendedorId = emprendedorId
        };

        await _productoRepo.AgregarAsync(producto);

        var productoCompleto = await _productoRepo.ObtenerConDetalleAsync(producto.Id)
            ?? throw new InvalidOperationException("Error al cargar el producto creado.");

        return _mapper.Map<ProductoResponse>(productoCompleto);
    }
}