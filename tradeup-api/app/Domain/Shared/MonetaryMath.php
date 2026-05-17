<?php

namespace App\Domain\Shared;

final class MonetaryMath
{
    /**
     * Rounds a BCMath decimal string half-up to $precision decimal places.
     * Works correctly for positive numbers.
     */
    public static function bcround(string $number, int $precision): string
    {
        if (str_contains($number, '.')) {
            $half = '0.'.str_repeat('0', $precision).'5';

            return bcadd($number, $half, $precision);
        }

        return $number;
    }

    /**
     * Divides two BCMath strings and rounds the result half-up to $scale decimal places.
     */
    public static function divideRound(string $numerator, string $denominator, int $scale): string
    {
        $raw = bcdiv($numerator, $denominator, $scale + 1);

        return self::bcround($raw, $scale);
    }

    /**
     * Multiplies two BCMath strings and rounds the result half-up to $scale decimal places.
     */
    public static function multiplyRound(string $a, string $b, int $scale): string
    {
        $raw = bcmul($a, $b, $scale + 1);

        return self::bcround($raw, $scale);
    }
}
