using FluentValidation;
using ITM.Emprendimientos.Application.DTOs.Requests;

namespace ITM.Emprendimientos.Application.Validators;

public class ActualizarPerfilCompradorValidator
    : AbstractValidator<ActualizarPerfilCompradorRequest>
{
    private static readonly string[] Formatos = { "image/jpeg", "image/png", "image/webp" };
    private const long MaxBytes = 3 * 1024 * 1024;

    public ActualizarPerfilCompradorValidator()
    {
        RuleFor(x => x.Apodo)
            .MaximumLength(50).WithMessage("El apodo no puede superar 50 caracteres.")
            .When(x => x.Apodo is not null);

        RuleFor(x => x.SobreTi)
            .MaximumLength(300).WithMessage("La descripción no puede superar 300 caracteres.")
            .When(x => x.SobreTi is not null);

        When(x => x.Foto is not null, () =>
        {
            RuleFor(x => x.Foto!.Length)
                .LessThanOrEqualTo(MaxBytes).WithMessage("La foto no puede superar 3 MB.");
            RuleFor(x => x.Foto!.ContentType)
                .Must(ct => Formatos.Contains(ct))
                .WithMessage("Solo se permiten imágenes JPEG, PNG o WebP.");
        });
    }
}