namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class CategoriaResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int TotalProductos { get; set; }
}