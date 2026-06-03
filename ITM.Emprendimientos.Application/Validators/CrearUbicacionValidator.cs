using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class CrearUbicacionValidator : AbstractValidator<CrearUbicacionRequest>
{
    public CrearUbicacionValidator()
    {
        RuleFor(x => x.NombreSede)
            .NotEmpty().WithMessage("El nombre de la sede es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(300).WithMessage("La descripción no puede superar 300 caracteres.");

        RuleFor(x => x.ReferenciaMapa)
            .MaximumLength(500).WithMessage("La referencia no puede superar 500 caracteres.")
            .When(x => x.ReferenciaMapa is not null);
    }
}