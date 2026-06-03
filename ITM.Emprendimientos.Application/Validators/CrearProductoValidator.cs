using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class CrearProductoValidator : AbstractValidator<CrearProductoRequest>
{
    private static readonly string[] Formatos = { "image/jpeg", "image/png", "image/webp" };
    private const long MaxBytes = 5 * 1024 * 1024;

    public CrearProductoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(80).WithMessage("El nombre no puede superar 80 caracteres.");

        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.Precio)
            .GreaterThan(0).WithMessage("El precio debe ser mayor a 0.");

        RuleFor(x => x.CategoriaId)
            .NotEmpty().WithMessage("Debe seleccionar una categoría.");

        When(x => x.Imagen is not null, () =>
        {
            RuleFor(x => x.Imagen!.Length)
                .LessThanOrEqualTo(MaxBytes)
                .WithMessage("La imagen no puede superar 5 MB.");
            RuleFor(x => x.Imagen!.ContentType)
                .Must(ct => Formatos.Contains(ct))
                .WithMessage("Solo se permiten imágenes JPEG, PNG o WebP.");
        });
    }
}