using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.DataAccess.Security;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;
using ITM.Emprendimientos.Domain.Factories;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;

namespace ITM.Emprendimientos.Application.Services;

public class UsuarioService
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly JwtTokenService _jwtService;

    public UsuarioService(IUsuarioRepository usuarioRepo, JwtTokenService jwtService)
    {
        _usuarioRepo = usuarioRepo;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegistrarAsync(RegistroRequest request)
    {
        if (await _usuarioRepo.ExisteEmailAsync(request.Email))
            throw new InvalidOperationException(
                $"El email '{request.Email}' ya está registrado.");

        var hash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var tipo = (TipoUsuario)request.TipoUsuario;
        var usuario = UsuariosFactory.Crear(tipo, request.Nombre, request.Email, hash);

        await _usuarioRepo.AgregarAsync(usuario);
        return GenerarAuthResponse(usuario);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var usuario = await _usuarioRepo.ObtenerPorEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Credenciales incorrectas.");

        if (!usuario.Habilitado)
            throw new UnauthorizedAccessException(
                "La cuenta está deshabilitada. Contacta al administrador.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            throw new UnauthorizedAccessException("Credenciales incorrectas.");

        return GenerarAuthResponse(usuario);
    }

    private AuthResponse GenerarAuthResponse(Usuario usuario)
    {
        var (token, expiracion) = _jwtService.GenerarToken(usuario);
        return new AuthResponse
        {
            Token = token,
            UsuarioId = usuario.Id,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Rol = usuario.Tipo.ToString(),
            Expiracion = expiracion
        };
    }
}