using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ITM.Emprendimientos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HorariosController : ControllerBase
{
    private readonly HorarioService _horarioService;
    private readonly IValidator<CrearHorarioRequest> _crearVal;
    private readonly IValidator<ActualizarHorarioRequest> _actualizarVal;

    public HorariosController(
        HorarioService horarioService,
        IValidator<CrearHorarioRequest> crearVal,
        IValidator<ActualizarHorarioRequest> actualizarVal)
    {
        _horarioService = horarioService;
        _crearVal = crearVal;
        _actualizarVal = actualizarVal;
    }

    private Guid ObtenerUsuarioId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Token inválido."));

    /// <summary>GET /api/Horarios?emprendedorId=</summary>
    [HttpGet]
    public async Task<ActionResult> ObtenerPorEmprendedor([FromQuery] Guid emprendedorId)
    {
        if (emprendedorId == Guid.Empty)
            return BadRequest(new { message = "Se requiere el emprendedorId." });
        return Ok(await _horarioService.ObtenerPorEmprendedorAsync(emprendedorId));
    }

    /// <summary>POST /api/Horarios</summary>
    [HttpPost]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> Crear([FromBody] CrearHorarioRequest request)
    {
        var val = await _crearVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        var response = await _horarioService.CrearAsync(request, ObtenerUsuarioId());
        return CreatedAtAction(nameof(ObtenerPorEmprendedor),
            new { emprendedorId = response.EmprendedorId }, response);
    }

    /// <summary>PUT /api/Horarios/{id}</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> Actualizar(Guid id, [FromBody] ActualizarHorarioRequest request)
    {
        var val = await _actualizarVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _horarioService.ActualizarAsync(id, request, ObtenerUsuarioId());
        return NoContent();
    }

    /// <summary>DELETE /api/Horarios/{id}</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> Eliminar(Guid id)
    {
        await _horarioService.EliminarAsync(id, ObtenerUsuarioId());
        return NoContent();
    }
}