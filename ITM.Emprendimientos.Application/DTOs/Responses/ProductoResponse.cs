namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class ProductoResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public string? ImagenUrl { get; set; }
    public string Estado { get; set; } = string.Empty;
    public bool AdminDisabled { get; set; }
    public Guid CategoriaId { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public Guid VendedorId { get; set; }
    public string VendedorNombre { get; set; } = string.Empty;
    public string VendedorDescripcion { get; set; } = string.Empty;
    public string? VendedorFotoUrl { get; set; }
    public string VendedorEmail { get; set; } = string.Empty;
    public DateTime CreadoEn { get; set; }
}