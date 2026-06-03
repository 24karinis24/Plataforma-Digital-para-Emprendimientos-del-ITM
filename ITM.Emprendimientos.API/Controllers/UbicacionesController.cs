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
public class UbicacionesController : ControllerBase
{
    private readonly UbicacionService _ubicacionService;
    private readonly IValidator<CrearUbicacionRequest> _crearVal;
    private readonly IValidator<ActualizarUbicacionRequest> _actualizarVal;

    public UbicacionesController(
        UbicacionService ubicacionService,
        IValidator<CrearUbicacionRequest> crearVal,
        IValidator<ActualizarUbicacionRequest> actualizarVal)
    {
        _ubicacionService = ubicacionService;
        _crearVal = crearVal;
        _actualizarVal = actualizarVal;
    }

    private Guid ObtenerUsuarioId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Token inválido."));

    /// <summary>GET /api/Ubicaciones?emprendedorId=</summary>
    [HttpGet]
    public async Task<ActionResult> ObtenerPorEmprendedor([FromQuery] Guid emprendedorId)
    {
        if (emprendedorId == Guid.Empty)
            return BadRequest(new { message = "Se requiere el emprendedorId." });
        return Ok(await _ubicacionService.ObtenerPorEmprendedorAsync(emprendedorId));
    }

    /// <summary>POST /api/Ubicaciones</summary>
    [HttpPost]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> Crear([FromBody] CrearUbicacionRequest request)
    {
        var val = await _crearVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        var response = await _ubicacionService.CrearAsync(request, ObtenerUsuarioId());
        return CreatedAtAction(nameof(ObtenerPorEmprendedor),
            new { emprendedorId = response.EmprendedorId }, response);
    }

    /// <summary>PUT /api/Ubicaciones/{id}</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> Actualizar(Guid id, [FromBody] ActualizarUbicacionRequest request)
    {
        var val = await _actualizarVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _ubicacionService.ActualizarAsync(id, request, ObtenerUsuarioId());
        return NoContent();
    }

    /// <summary>DELETE /api/Ubicaciones/{id}</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> Eliminar(Guid id)
    {
        await _ubicacionService.EliminarAsync(id, ObtenerUsuarioId());
        return NoContent();
    }
}