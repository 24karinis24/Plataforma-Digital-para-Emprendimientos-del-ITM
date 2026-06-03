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
public class PerfilesController : ControllerBase
{
    private readonly PerfilService _perfilService;
    private readonly IValidator<ActualizarPerfilEmprendedorRequest> _emprendedorVal;
    private readonly IValidator<ActualizarPerfilCompradorRequest> _compradorVal;
    private readonly IValidator<ActualizarPerfilAdminRequest> _adminVal;

    public PerfilesController(
        PerfilService perfilService,
        IValidator<ActualizarPerfilEmprendedorRequest> emprendedorVal,
        IValidator<ActualizarPerfilCompradorRequest> compradorVal,
        IValidator<ActualizarPerfilAdminRequest> adminVal)
    {
        _perfilService = perfilService;
        _emprendedorVal = emprendedorVal;
        _compradorVal = compradorVal;
        _adminVal = adminVal;
    }

    private Guid ObtenerUsuarioId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Token inválido."));

    /// <summary>GET /api/Perfiles/{id} — Propio usuario</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult> ObtenerPerfil(Guid id)
    {
        if (ObtenerUsuarioId() != id)
            throw new UnauthorizedAccessException(
                "No tienes permiso para ver el perfil de otro usuario.");
        return Ok(await _perfilService.ObtenerPerfilAsync(id));
    }

    /// <summary>GET /api/Perfiles/publico/{id} — Cualquier usuario autenticado</summary>
    [HttpGet("publico/{id:guid}")]
    public async Task<ActionResult> ObtenerPerfilPublico(Guid id)
        => Ok(await _perfilService.ObtenerPerfilAsync(id));

    /// <summary>PUT /api/Perfiles/{id}/emprendedor</summary>
    [HttpPut("{id:guid}/emprendedor")]
    [Authorize(Roles = "Emprendedor")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ActualizarEmprendedor(
        Guid id, [FromForm] ActualizarPerfilEmprendedorRequest request)
    {
        if (ObtenerUsuarioId() != id)
            throw new UnauthorizedAccessException("No puedes editar el perfil de otro usuario.");

        var val = await _emprendedorVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _perfilService.ActualizarEmprendedorAsync(id, request);
        return NoContent();
    }

    /// <summary>PUT /api/Perfiles/{id}/comprador</summary>
    [HttpPut("{id:guid}/comprador")]
    [Authorize(Roles = "Comprador")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ActualizarComprador(
        Guid id, [FromForm] ActualizarPerfilCompradorRequest request)
    {
        if (ObtenerUsuarioId() != id)
            throw new UnauthorizedAccessException("No puedes editar el perfil de otro usuario.");

        var val = await _compradorVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _perfilService.ActualizarCompradorAsync(id, request);
        return NoContent();
    }

    /// <summary>PUT /api/Perfiles/{id}/admin</summary>
    [HttpPut("{id:guid}/admin")]
    [Authorize(Roles = "Administrador")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> ActualizarAdmin(
        Guid id, [FromForm] ActualizarPerfilAdminRequest request)
    {
        if (ObtenerUsuarioId() != id)
            throw new UnauthorizedAccessException("No puedes editar el perfil de otro usuario.");

        var val = await _adminVal.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _perfilService.ActualizarAdminAsync(id, request);
        return NoContent();
    }
}