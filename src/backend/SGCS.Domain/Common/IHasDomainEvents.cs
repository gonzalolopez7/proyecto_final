using MediatR;

namespace SGCS.Domain.Common;

/// <summary>
/// Interfaz para entidades que publican domain events.
/// El ApplicationDbContext recopila y despacha estos eventos antes de SaveChanges.
/// </summary>
public interface IHasDomainEvents
{
    IReadOnlyCollection<INotification> DomainEvents { get; }
    void AddDomainEvent(INotification domainEvent);
    void RemoveDomainEvent(INotification domainEvent);
    void ClearDomainEvents();
}
