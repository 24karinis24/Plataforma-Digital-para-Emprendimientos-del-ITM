using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;

namespace ITM.Emprendimientos.Application.Services;

public class UbicacionService
{
    private readonly IUbicacionRepository _ubicacionRepo;
    private readonly IMapper _mapper;

    public UbicacionService(IUbicacionRepository ubicacionRepo, IMapper mapper)
    {
        _ubicacionRepo = ubicacionRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UbicacionResponse>> ObtenerPorEmprendedorAsync(Guid emprendedorId)
        => _mapper.Map<IEnumerable<UbicacionResponse>>(
               await _ubicacionRepo.ObtenerPorEmprendedorAsync(emprendedorId));

    public async Task<UbicacionResponse> CrearAsync(CrearUbicacionRequest request, Guid emprendedorId)
    {
        var ubicacion = new Ubicacion
        {
            NombreSede = request.NombreSede,
            Descripcion = request.Descripcion,
            ReferenciaMapa = request.ReferenciaMapa,
            EmprendedorId = emprendedorId
        };
        await _ubicacionRepo.AgregarAsync(ubicacion);
        return _mapper.Map<UbicacionResponse>(ubicacion);
    }

    public async Task ActualizarAsync(Guid id, ActualizarUbicacionRequest request, Guid emprendedorId)
    {
        var ubicacion = await _ubicacionRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Ubicación con Id '{id}' no encontrada.");

        if (ubicacion.EmprendedorId != emprendedorId)
            throw new UnauthorizedAccessException("No tienes permiso para editar esta ubicación.");

        ubicacion.NombreSede = request.NombreSede;
        ubicacion.Descripcion = request.Descripcion;
        ubicacion.ReferenciaMapa = request.ReferenciaMapa;
        await _ubicacionRepo.ActualizarAsync(ubicacion);
    }

    public async Task EliminarAsync(Guid id, Guid emprendedorId)
    {
        var ubicacion = await _ubicacionRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Ubicación con Id '{id}' no encontrada.");

        if (ubicacion.EmprendedorId != emprendedorId)
            throw new UnauthorizedAccessException("No tienes permiso para eliminar esta ubicación.");

        await _ubicacionRepo.EliminarAsync(id);
    }
}