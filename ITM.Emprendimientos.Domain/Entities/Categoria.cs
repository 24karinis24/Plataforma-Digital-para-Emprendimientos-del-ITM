namespace ITM.Emprendimientos.Domain.Entities;

public class Categoria : AuditBase
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    // Navigation Property
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}