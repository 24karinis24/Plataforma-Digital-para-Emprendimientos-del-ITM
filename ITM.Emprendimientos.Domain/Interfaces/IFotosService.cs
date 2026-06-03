namespace ITM.Emprendimientos.Domain.Interfaces;

/// <summary>
/// Contrato para el servicio de almacenamiento de imágenes.
/// La implementación concreta (FotosComponent) vive en DataAccess
/// y envía las fotos a Supabase vía HTTPS. El dominio no conoce Supabase.
/// </summary>
public interface IFotosService
{
    Task<string> SubirFotoAsync(Stream imagen, string nombreArchivo, string contentType);
    Task EliminarFotoAsync(string url);
}