using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;
using ITM.Emprendimientos.Domain.Interfaces;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;

namespace ITM.Emprendimientos.Application.Services;

public class PerfilService
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IProductoRepository _productoRepo;
    private readonly IFotosService _fotosService;
    private readonly IMapper _mapper;

    public PerfilService(
        IUsuarioRepository usuarioRepo,
        IProductoRepository productoRepo,
        IFotosService fotosService,
        IMapper mapper)
    {
        _usuarioRepo = usuarioRepo;
        _productoRepo = productoRepo;
        _fotosService = fotosService;
        _mapper = mapper;
    }

    public async Task<object> ObtenerPerfilAsync(Guid usuarioId)
    {
        var usuario = await _usuarioRepo.ObtenerPorIdAsync(usuarioId)
            ?? throw new KeyNotFoundException("Usuario no encontrado.");

        return usuario.Tipo switch
        {
            TipoUsuario.Emprendedor => _mapper.Map<PerfilEmprendedorResponse>(usuario),
            TipoUsuario.Comprador => _mapper.Map<PerfilCompradorResponse>(usuario),
            TipoUsuario.Administrador => _mapper.Map<PerfilAdminResponse>(usuario),
            _ => throw new InvalidOperationException("Tipo de usuario desconocido.")
        };
    }

    public async Task ActualizarEmprendedorAsync(
        Guid usuarioId,
        ActualizarPerfilEmprendedorRequest request)
    {
        var usuario = await _usuarioRepo.ObtenerPorIdAsync(usuarioId)
            ?? throw new KeyNotFoundException("Usuario no encontrado.");

        if (usuario is not Emprendedor emprendedor)
            throw new UnauthorizedAccessException("Este perfil no es de un Emprendedor.");

        if (request.Foto is not null)
        {
            if (!string.IsNullOrWhiteSpace(emprendedor.FotoUrl))
                await _fotosService.EliminarFotoAsync(emprendedor.FotoUrl);

            using var stream = request.Foto.OpenReadStream();
            emprendedor.FotoUrl = await _fotosService.SubirFotoAsync(
                stream, request.Foto.FileName, request.Foto.ContentType);
        }

        emprendedor.NombreEmprendimiento = request.NombreEmprendimiento;
        emprendedor.Descripcion = request.Descripcion;

        await _usuarioRepo.ActualizarAsync(emprendedor);

        await _productoRepo.PropagarpPerfilAProductosAsync(
            usuarioId,
            emprendedor.NombreEmprendimiento,
            emprendedor.Descripcion,
            emprendedor.FotoUrl);
    }

    public async Task ActualizarCompradorAsync(
        Guid usuarioId,
        ActualizarPerfilCompradorRequest request)
    {
        var usuario = await _usuarioRepo.ObtenerPorIdAsync(usuarioId)
            ?? throw new KeyNotFoundException("Usuario no encontrado.");

        if (usuario is not Comprador comprador)
            throw new UnauthorizedAccessException("Este perfil no es de un Comprador.");

        if (request.Foto is not null)
        {
            if (!string.IsNullOrWhiteSpace(comprador.FotoUrl))
                await _fotosService.EliminarFotoAsync(comprador.FotoUrl);

            using var stream = request.Foto.OpenReadStream();
            comprador.FotoUrl = await _fotosService.SubirFotoAsync(
                stream, request.Foto.FileName, request.Foto.ContentType);
        }

        comprador.Apodo = request.Apodo;
        comprador.SobreTi = request.SobreTi;
        await _usuarioRepo.ActualizarAsync(comprador);
    }

    public async Task ActualizarAdminAsync(
        Guid usuarioId,
        ActualizarPerfilAdminRequest request)
    {
        var usuario = await _usuarioRepo.ObtenerPorIdAsync(usuarioId)
            ?? throw new KeyNotFoundException("Usuario no encontrado.");

        if (usuario is not Administrador admin)
            throw new UnauthorizedAccessException("Este perfil no es de un Administrador.");

        if (request.Foto is not null)
        {
            if (!string.IsNullOrWhiteSpace(admin.FotoUrl))
                await _fotosService.EliminarFotoAsync(admin.FotoUrl);

            using var stream = request.Foto.OpenReadStream();
            admin.FotoUrl = await _fotosService.SubirFotoAsync(
                stream, request.Foto.FileName, request.Foto.ContentType);
        }

        admin.Descripcion = request.Descripcion;
        await _usuarioRepo.ActualizarAsync(admin);
    }
}