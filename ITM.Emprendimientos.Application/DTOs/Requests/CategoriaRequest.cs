namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class CategoriaRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}