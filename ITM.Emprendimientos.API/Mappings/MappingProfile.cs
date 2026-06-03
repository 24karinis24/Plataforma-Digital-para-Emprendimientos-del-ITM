using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Requests;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Usuario ──────────────────────────────────────────────────
        CreateMap<Usuario, UsuarioResponse>()
            .ForMember(dest => dest.Rol,
                       opt => opt.MapFrom(src => src.Tipo.ToString()));
        // ── Perfiles ──────────────────────────────────────────────────────────
        CreateMap<Emprendedor, PerfilEmprendedorResponse>()
            .ForMember(dest => dest.Rol, opt => opt.MapFrom(_ => "Emprendedor"));

        CreateMap<Comprador, PerfilCompradorResponse>()
            .ForMember(dest => dest.Rol, opt => opt.MapFrom(_ => "Comprador"));

        CreateMap<Administrador, PerfilAdminResponse>()
            .ForMember(dest => dest.Rol, opt => opt.MapFrom(_ => "Administrador"));

        // ── Horarios ──────────────────────────────────────────────────────────
        CreateMap<Horario, HorarioResponse>()
            .ForMember(dest => dest.DiaNombre,
                       opt => opt.MapFrom(src => src.Dia.ToString()))
            .ForMember(dest => dest.HoraApertura,
                       opt => opt.MapFrom(src => src.HoraApertura.ToString("HH:mm")))
            .ForMember(dest => dest.HoraCierre,
                       opt => opt.MapFrom(src => src.HoraCierre.ToString("HH:mm")));

        // ── Ubicaciones ───────────────────────────────────────────────────────
        CreateMap<Ubicacion, UbicacionResponse>();

        // ── Categoria ────────────────────────────────────────────────
        CreateMap<CategoriaRequest, Categoria>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreadoEn, opt => opt.Ignore())
            .ForMember(dest => dest.Productos, opt => opt.Ignore());

        // ── Producto ─────────────────────────────────────────────────
        CreateMap<Categoria, CategoriaResponse>()
            .ForMember(dest => dest.TotalProductos,
                       opt => opt.MapFrom(src => src.Productos.Count));
        CreateMap<Producto, ProductoResponse>()
     .ForMember(dest => dest.Estado,
               opt => opt.MapFrom(src => src.ObtenerNombreEstado()))
      .ForMember(dest => dest.CategoriaNombre,
               opt => opt.MapFrom(src => src.Categoria != null
                                          ? src.Categoria.Nombre : string.Empty))
     .ForMember(dest => dest.VendedorId,
               opt => opt.MapFrom(src => src.EmprendedorId))
      .ForMember(dest => dest.VendedorNombre,
               opt => opt.MapFrom(src => src.Emprendedor != null
                                          ? src.Emprendedor.NombreEmprendimiento
                                          : string.Empty))
      .ForMember(dest => dest.VendedorDescripcion,
               opt => opt.MapFrom(src => src.Emprendedor != null
                                          ? src.Emprendedor.Descripcion : string.Empty))
      .ForMember(dest => dest.VendedorFotoUrl,
               opt => opt.MapFrom(src => src.Emprendedor != null
                                          ? src.Emprendedor.FotoUrl : null))
     .ForMember(dest => dest.VendedorEmail,
               opt => opt.MapFrom(src => src.Emprendedor != null
                                          ? src.Emprendedor.Email : string.Empty));
    }

}