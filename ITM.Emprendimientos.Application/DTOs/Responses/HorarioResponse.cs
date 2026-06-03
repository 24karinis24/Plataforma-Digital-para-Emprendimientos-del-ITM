namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class HorarioResponse
{
    public Guid Id { get; set; }
    public int Dia { get; set; }
    public string DiaNombre { get; set; } = string.Empty;
    public string HoraApertura { get; set; } = string.Empty;
    public string HoraCierre { get; set; } = string.Empty;
    public string Sede { get; set; } = string.Empty;
    public Guid EmprendedorId { get; set; }
}