using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSets — una por tabla
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Emprendedor> Emprendedores => Set<Emprendedor>();
    public DbSet<Comprador> Compradores => Set<Comprador>();
    public DbSet<Administrador> Administradores => Set<Administrador>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Horario> Horarios => Set<Horario>();
    public DbSet<Ubicacion> Ubicaciones => Set<Ubicacion>();
    public DbSet<AuditoriaProducto> AuditoriasProducto => Set<AuditoriaProducto>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Herencia: Table Per Hierarchy (TPH) ──
        // Una sola tabla 'Usuarios' con columna discriminadora 'Tipo'
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.HasKey(u => u.Id);
            entity.HasDiscriminator(u => u.Tipo)
                  .HasValue<Emprendedor>(TipoUsuario.Emprendedor)
                  .HasValue<Comprador>(TipoUsuario.Comprador)
                  .HasValue<Administrador>(TipoUsuario.Administrador);

            entity.Property(u => u.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Habilitado).HasDefaultValue(true);
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // ── Configuración específica de Emprendedor ──
        modelBuilder.Entity<Emprendedor>(entity =>
        {
            entity.Property(e => e.NombreEmprendimiento).HasMaxLength(100);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.FotoUrl).HasMaxLength(1000);
        });

        // ── Configuración específica de Comprador ──
        modelBuilder.Entity<Comprador>(entity =>
        {
            entity.Property(c => c.Apodo).HasMaxLength(50);
            entity.Property(c => c.SobreTi).HasMaxLength(300);
            entity.Property(c => c.FotoUrl).HasMaxLength(1000);
        });

        // ── Configuración específica de Administrador ──
        modelBuilder.Entity<Administrador>(entity =>
        {
            entity.Property(a => a.Descripcion).HasMaxLength(300);
            entity.Property(a => a.FotoUrl).HasMaxLength(1000);
        });

        // ── Categoria ──
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Descripcion).HasMaxLength(300);
            entity.HasIndex(c => c.Nombre).IsUnique();
        });

        // ── Producto ──
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(80);
            entity.Property(p => p.Descripcion).IsRequired().HasMaxLength(500);
            entity.Property(p => p.Precio).IsRequired().HasPrecision(18, 2);
            entity.Property(p => p.ImagenUrl).HasMaxLength(1000);
            entity.Property(p => p.Estado).IsRequired();
            entity.Property(p => p.AdminDisabled).HasDefaultValue(false);

            // Relación Producto → Categoria (N:1)
            entity.HasOne(p => p.Categoria)
                  .WithMany(c => c.Productos)
                  .HasForeignKey(p => p.CategoriaId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Relación Producto → Emprendedor (N:1)
            entity.HasOne(p => p.Emprendedor)
                  .WithMany(e => e.Productos)
                  .HasForeignKey(p => p.EmprendedorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Horario ──
        modelBuilder.Entity<Horario>(entity =>
        {
            entity.HasKey(h => h.Id);
            entity.Property(h => h.Sede).IsRequired().HasMaxLength(100);
            entity.Property(h => h.Dia).IsRequired();
            entity.Property(h => h.HoraApertura).IsRequired();
            entity.Property(h => h.HoraCierre).IsRequired();

            entity.HasOne(h => h.Emprendedor)
                  .WithMany(e => e.Horarios)
                  .HasForeignKey(h => h.EmprendedorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Ubicacion ──
        modelBuilder.Entity<Ubicacion>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.NombreSede).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Descripcion).IsRequired().HasMaxLength(300);
            entity.Property(u => u.ReferenciaMapa).HasMaxLength(500);

            entity.HasOne(u => u.Emprendedor)
                  .WithMany(e => e.Ubicaciones)
                  .HasForeignKey(u => u.EmprendedorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Auditoría de Producto ──
        modelBuilder.Entity<AuditoriaProducto>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.NombreProducto).IsRequired().HasMaxLength(80);
            entity.Property(a => a.EstadoAnterior).IsRequired().HasMaxLength(20);
            entity.Property(a => a.NuevoEstado).IsRequired().HasMaxLength(20);
            entity.Property(a => a.ResponsableEmail).IsRequired().HasMaxLength(150);
            entity.Property(a => a.Motivo).HasMaxLength(300);
            entity.Property(a => a.OcurridoEn).IsRequired();

            // Índice para búsqueda rápida por producto
            entity.HasIndex(a => a.ProductoId);
        });

        // ── Seed de Categorías ──
        modelBuilder.Entity<Categoria>().HasData(
            new Categoria { Id = Guid.Parse("a1b2c3d4-0001-0000-0000-000000000000"), Nombre = "Comidas y Bebidas", CreadoEn = DateTime.UtcNow },
            new Categoria { Id = Guid.Parse("a1b2c3d4-0002-0000-0000-000000000000"), Nombre = "Ropa y Accesorios", CreadoEn = DateTime.UtcNow },
            new Categoria { Id = Guid.Parse("a1b2c3d4-0003-0000-0000-000000000000"), Nombre = "Tecnología", CreadoEn = DateTime.UtcNow },
            new Categoria { Id = Guid.Parse("a1b2c3d4-0004-0000-0000-000000000000"), Nombre = "Arte y Manualidades", CreadoEn = DateTime.UtcNow },
            new Categoria { Id = Guid.Parse("a1b2c3d4-0005-0000-0000-000000000000"), Nombre = "Servicios", CreadoEn = DateTime.UtcNow }
        );
    }
}