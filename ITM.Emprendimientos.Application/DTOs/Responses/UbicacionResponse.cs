namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class UbicacionResponse
{
    public Guid Id { get; set; }
    public string NombreSede { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? ReferenciaMapa { get; set; }
    public Guid EmprendedorId { get; set; }
}