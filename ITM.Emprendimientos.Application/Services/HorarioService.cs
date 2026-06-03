using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;

namespace ITM.Emprendimientos.Application.Services;

public class HorarioService
{
    private readonly IHorarioRepository _horarioRepo;
    private readonly IMapper _mapper;

    public HorarioService(IHorarioRepository horarioRepo, IMapper mapper)
    {
        _horarioRepo = horarioRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<HorarioResponse>> ObtenerPorEmprendedorAsync(Guid emprendedorId)
        => _mapper.Map<IEnumerable<HorarioResponse>>(
               await _horarioRepo.ObtenerPorEmprendedorAsync(emprendedorId));

    public async Task<HorarioResponse> CrearAsync(CrearHorarioRequest request, Guid emprendedorId)
    {
        var horario = new Horario
        {
            Dia = (DiaSemana)request.Dia,
            HoraApertura = TimeOnly.Parse(request.HoraApertura),
            HoraCierre = TimeOnly.Parse(request.HoraCierre),
            Sede = request.Sede,
            EmprendedorId = emprendedorId
        };
        await _horarioRepo.AgregarAsync(horario);
        return _mapper.Map<HorarioResponse>(horario);
    }

    public async Task ActualizarAsync(Guid id, ActualizarHorarioRequest request, Guid emprendedorId)
    {
        var horario = await _horarioRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Horario con Id '{id}' no encontrado.");

        if (horario.EmprendedorId != emprendedorId)
            throw new UnauthorizedAccessException("No tienes permiso para editar este horario.");

        horario.Dia = (DiaSemana)request.Dia;
        horario.HoraApertura = TimeOnly.Parse(request.HoraApertura);
        horario.HoraCierre = TimeOnly.Parse(request.HoraCierre);
        horario.Sede = request.Sede;
        await _horarioRepo.ActualizarAsync(horario);
    }

    public async Task EliminarAsync(Guid id, Guid emprendedorId)
    {
        var horario = await _horarioRepo.ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Horario con Id '{id}' no encontrado.");

        if (horario.EmprendedorId != emprendedorId)
            throw new UnauthorizedAccessException("No tienes permiso para eliminar este horario.");

        await _horarioRepo.EliminarAsync(id);
    }
}