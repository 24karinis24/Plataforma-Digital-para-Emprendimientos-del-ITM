using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
namespace ITM.Emprendimientos.Application.Services;

public class CategoriaService
{
    private readonly ICategoriaRepository _categoriaRepo;
    private readonly IMapper _mapper;

    public CategoriaService(ICategoriaRepository categoriaRepo, IMapper mapper)
    {
        _categoriaRepo = categoriaRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CategoriaResponse>> ObtenerTodasAsync()
        => _mapper.Map<IEnumerable<CategoriaResponse>>(
               await _categoriaRepo.ObtenerTodosAsync());

    public async Task<CategoriaResponse> ObtenerPorIdAsync(Guid id)
    {
        var categoria = await _categoriaRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Categoría con Id '{id}' no encontrada.");
        return _mapper.Map<CategoriaResponse>(categoria);
    }

    public async Task<CategoriaResponse> CrearAsync(CategoriaRequest request)
    {
        if (await _categoriaRepo.ExisteNombreAsync(request.Nombre))
            throw new InvalidOperationException(
                $"Ya existe una categoría con el nombre '{request.Nombre}'.");

        var categoria = _mapper.Map<Categoria>(request);
        await _categoriaRepo.AgregarAsync(categoria);
        return _mapper.Map<CategoriaResponse>(categoria);
    }

    public async Task ActualizarAsync(Guid id, CategoriaRequest request)
    {
        var categoria = await _categoriaRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Categoría con Id '{id}' no encontrada.");

        // Verificar nombre duplicado solo si cambió
        if (!categoria.Nombre.Equals(request.Nombre, StringComparison.OrdinalIgnoreCase))
        {
            if (await _categoriaRepo.ExisteNombreAsync(request.Nombre))
                throw new InvalidOperationException(
                    $"Ya existe una categoría con el nombre '{request.Nombre}'.");
        }

        categoria.Nombre = request.Nombre;
        categoria.Descripcion = request.Descripcion;
        await _categoriaRepo.ActualizarAsync(categoria);
    }

    public async Task EliminarAsync(Guid id)
    {
        _ = await _categoriaRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Categoría con Id '{id}' no encontrada.");
        await _categoriaRepo.EliminarAsync(id);
    }
}