using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class CambiarEstadoValidator : AbstractValidator<CambiarEstadoRequest>
{
    private static readonly string[] Acciones = { "activar", "ocultar", "eliminar" };

    public CambiarEstadoValidator()
    {
        RuleFor(x => x.Accion)
            .NotEmpty().WithMessage("La acción es obligatoria.")
            .Must(a => Acciones.Contains(a.ToLower()))
            .WithMessage("Acción inválida. Use: 'activar', 'ocultar' o 'eliminar'.");

        When(x => x.Accion?.ToLower() is "ocultar" or "eliminar", () =>
            RuleFor(x => x.Motivo)
                .NotEmpty().WithMessage("El motivo es obligatorio al ocultar o eliminar.")
                .MaximumLength(300).WithMessage("El motivo no puede superar 300 caracteres."));
    }
}