using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITM.Emprendimientos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _usuarioService;
    private readonly IValidator<RegistroRequest> _registroValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public UsuariosController(
        UsuarioService usuarioService,
        IValidator<RegistroRequest> registroValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _usuarioService = usuarioService;
        _registroValidator = registroValidator;
        _loginValidator = loginValidator;
    }

    /// <summary>POST /api/Usuarios/registro</summary>
    [HttpPost("registro")]
    public async Task<ActionResult> Registro([FromBody] RegistroRequest request)
    {
        var val = await _registroValidator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        var response = await _usuarioService.RegistrarAsync(request);
        return CreatedAtAction(nameof(Registro), response);
    }

    /// <summary>POST /api/Usuarios/login</summary>
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        var val = await _loginValidator.ValidateAsync(request);
        if (!val.IsValid)
            return BadRequest(new { errors = val.Errors.Select(e => e.ErrorMessage) });

        var response = await _usuarioService.LoginAsync(request);
        return Ok(response);
    }
}