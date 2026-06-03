using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.Facades;
using ITM.Emprendimientos.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ITM.Emprendimientos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly ProductoFacade _facade;
    private readonly ProductoService _productoService;
    private readonly ProductoQueryService _queryService;
    private readonly IValidator<CrearProductoRequest> _crearValidator;
    private readonly IValidator<ActualizarProductoRequest> _actualizarValidator;
    private readonly IValidator<CambiarEstadoRequest> _estadoValidator;

    public ProductosController(
        ProductoFacade facade,
        ProductoService productoService,
        ProductoQueryService queryService,
        IValidator<CrearProductoRequest> crearValidator,
        IValidator<ActualizarProductoRequest> actualizarValidator,
        IValidator<CambiarEstadoRequest> estadoValidator)
    {
        _facade = facade;
        _productoService = productoService;
        _queryService = queryService;
        _crearValidator = crearValidator;
        _actualizarValidator = actualizarValidator;
        _estadoValidator = estadoValidator;
    }

    private Guid ObtenerUsuarioId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Token inválido."));

    private string ObtenerEmail() =>
        User.FindFirstValue(ClaimTypes.Email)
            ?? throw new UnauthorizedAccessException("Token inválido.");

    /// <summary>GET /api/Productos?busqueda=&categoriaId= — Comprador</summary>
    [HttpGet]
    [Authorize(Roles = "Comprador")]
    public async Task<ActionResult> ObtenerCatalogo(
        [FromQuery] string? busqueda, [FromQuery] string? categoriaId)
        => Ok(await _queryService.ObtenerDisponiblesAsync(busqueda, categoriaId));

    /// <summary>GET /api/Productos/admin — Administrador</summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> ObtenerTodosAdmin(
        [FromQuery] string? busqueda, [FromQuery] string? categoriaId)
        => Ok(await _queryService.ObtenerTodosParaAdminAsync(busqueda, categoriaId));

    /// <summary>GET /api/Productos/mis-productos — Emprendedor</summary>
    [HttpGet("mis-productos")]
    [Authorize(Roles = "Emprendedor")]
    public async Task<ActionResult> ObtenerMisProductos()
        => Ok(await _queryService.ObtenerMisProductosAsync(ObtenerUsuarioId()));

    /// <summary>GET /api/Productos/estadisticas — Administrador</summary>
    [HttpGet("estadisticas")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult> ObtenerEstadisticas()
        => Ok(await _queryService.ObtenerEstadisticasAsync());

    /// <summary>GET /api/Productos/{id}</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult> ObtenerDetalle(Guid id)
        => Ok(await _queryService.ObtenerDetalleAsync(id));

    /// <summary>POST /api/Productos — Emprendedor</summary>
    [HttpPost]
    [Authorize(Roles = "Emprendedor")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> Crear([FromForm] CrearProductoRequest request)
    {
        var val = await _crearValidator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        var response = await _facade.CrearProductoAsync(request, ObtenerUsuarioId());
        return CreatedAtAction(nameof(ObtenerDetalle), new { id = response.Id }, response);
    }

    /// <summary>PUT /api/Productos/{id} — Emprendedor</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Emprendedor")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult> Actualizar(
        Guid id, [FromForm] ActualizarProductoRequest request)
    {
        var val = await _actualizarValidator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _productoService.ActualizarAsync(id, request, ObtenerUsuarioId());
        return NoContent();
    }

    /// <summary>PATCH /api/Productos/{id}/estado — Emprendedor / Admin</summary>
    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Emprendedor,Administrador")]
    public async Task<ActionResult> CambiarEstado(
        Guid id, [FromBody] CambiarEstadoRequest request)
    {
        var val = await _estadoValidator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        await _productoService.CambiarEstadoAsync(
            id, request, ObtenerEmail(), User.IsInRole("Administrador"));
        return NoContent();
    }

    /// <summary>DELETE /api/Productos/{id} — Emprendedor / Admin</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Emprendedor,Administrador")]
    public async Task<ActionResult> Eliminar(Guid id)
    {
        var esAdmin = User.IsInRole("Administrador");
        await _productoService.CambiarEstadoAsync(
            id,
            new CambiarEstadoRequest
            {
                Accion = "eliminar",
                Motivo = esAdmin ? "Eliminado por administrador" : "Eliminado por emprendedor"
            },
            ObtenerEmail(),
            esAdmin);
        return NoContent();
    }
}