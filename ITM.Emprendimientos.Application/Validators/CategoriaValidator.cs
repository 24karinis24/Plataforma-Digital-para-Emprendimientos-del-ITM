using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class CategoriaValidator : AbstractValidator<CategoriaRequest>
{
    public CategoriaValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre de la categoría es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(300).WithMessage("La descripción no puede superar 300 caracteres.")
            .When(x => x.Descripcion is not null);
    }
}