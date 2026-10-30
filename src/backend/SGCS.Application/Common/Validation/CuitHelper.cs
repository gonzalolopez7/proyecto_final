namespace SGCS.Application.Common.Validation;

public static class CuitHelper
{
    private static readonly int[] Multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    public static bool IsValidCuit(string? cuit)
    {
        if (string.IsNullOrWhiteSpace(cuit) || cuit.Length != 11 || !cuit.All(char.IsDigit))
            return false;

        int suma = 0;
        for (int i = 0; i < 10; i++)
        {
            suma += (cuit[i] - '0') * Multiplicadores[i];
        }

        int resto = suma % 11;
        int digitoEsperado = resto switch
        {
            0 => 0,
            1 => -1,
            _ => 11 - resto
        };

        return digitoEsperado == (cuit[10] - '0');
    }
}