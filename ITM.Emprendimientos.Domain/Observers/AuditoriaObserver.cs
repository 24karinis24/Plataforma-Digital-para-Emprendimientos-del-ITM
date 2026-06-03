using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Events;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace ITM.Emprendimientos.Domain.Observers;

/// <summary>
/// Observador: persiste cada transición de estado en la bitácora de auditoría.
/// Garantiza trazabilidad completa: qué cambió, de qué estado a cuál,
/// quién lo hizo y cuándo.
/// </summary>
public class AuditoriaObserver : IObservadorProducto
{
    private readonly IAuditoriaRepository _auditoriaRepo;
    private readonly ILogger<AuditoriaObserver> _logger;

    public AuditoriaObserver(
        IAuditoriaRepository auditoriaRepo,
        ILogger<AuditoriaObserver> logger)
    {
        _auditoriaRepo = auditoriaRepo;
        _logger = logger;
    }

    public async Task OnProductoCambiadoAsync(ProductoEstadoCambiadoEvent evento)
    {
        try
        {
            var entrada = new AuditoriaProducto
            {
                ProductoId = evento.ProductoId,
                NombreProducto = evento.NombreProducto,
                EstadoAnterior = evento.EstadoAnterior,
                NuevoEstado = evento.NuevoEstado,
                ResponsableEmail = evento.ResponsableEmail,
                Motivo = evento.Motivo,
                OcurridoEn = evento.OcurridoEn
            };

            await _auditoriaRepo.AgregarAsync(entrada);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AUDITORÍA] Error al registrar cambio del producto {Id}",
                             evento.ProductoId);
            // No relanzar — el cambio de estado ya fue persistido correctamente
        }
    }
}