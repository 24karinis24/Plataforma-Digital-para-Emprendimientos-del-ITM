namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class CambiarEstadoRequest
{
    /// <summary>"activar" | "ocultar" | "eliminar"</summary>
    public string Accion { get; set; } = string.Empty;
    public string? Motivo { get; set; }
}