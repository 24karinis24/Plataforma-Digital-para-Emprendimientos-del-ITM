using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITM.Emprendimientos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly CategoriaService _categoriaService;
    private readonly IValidator<CategoriaRequest> _validator;

    public CategoriasController(
        CategoriaService categoriaService,
        IValidator<CategoriaRequest> validator)
    {
        _categoriaService = categoriaService;
        _validator = validator;
    }

    /// <summary>GET /api/Categorias — Público</summary>
    [HttpGet]
    public async Task<ActionResult> ObtenerTodas()
        => Ok(await _categoriaService.ObtenerTodasAsync());

    /// <summary>GET /api/Categorias/{id}</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult> ObtenerPorId(Guid id)
        => Ok(await _categoriaService.ObtenerPorIdAsync(id));

    /// <summary>POST /api/Categorias — Solo Admin</summary>
    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> Crear([FromBody] CategoriaRequest request)
    {
        var val = await _validator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        var response = await _categoriaService.CrearAsync(request);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = response.Id }, response);
    }

    /// <summary>PUT /api/Categorias/{id} — Solo Admin</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> Actualizar(Guid id, [FromBody] CategoriaRequest request)
    {
        var val = await _validator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _categoriaService.ActualizarAsync(id, request);
        return NoContent();
    }

    /// <summary>DELETE /api/Categorias/{id} — Solo Admin</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> Eliminar(Guid id)
    {
        await _categoriaService.EliminarAsync(id);
        return NoContent();
    }
}