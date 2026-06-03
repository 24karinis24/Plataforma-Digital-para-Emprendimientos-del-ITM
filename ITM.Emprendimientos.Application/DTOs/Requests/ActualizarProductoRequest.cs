using Microsoft.AspNetCore.Http;

namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class ActualizarProductoRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public Guid CategoriaId { get; set; }
    public IFormFile? Imagen { get; set; }
}