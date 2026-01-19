<?php

namespace App\Constants;

class Status
{
    // Status values
    const NEW = 1;
    const TRIAGED = 2;
    const APPROVED = 3;
    const ISSUED = 4;
    const ACKNOWLEDGED = 5;
    const CANCELED = 6;
    const DISAPPROVED = 7;

    // Status labels
    const LABELS = [
        self::NEW => 'New',
        self::TRIAGED => 'Triaged',
        self::APPROVED => 'Approved',
        self::ISSUED => 'Issued',
        self::ACKNOWLEDGED => 'Acknowledged',
        self::CANCELED => 'Canceled',
        self::DISAPPROVED => 'Disapproved',
    ];

    // Status colors for UI
    const COLORS = [
        self::NEW      => 'gold',
        self::TRIAGED     => 'lime',
        self::APPROVED      => 'blue',
        self::ISSUED         => 'green',
        self::ACKNOWLEDGED  => 'green',
        self::CANCELED    => 'volcano',
        self::DISAPPROVED  => 'red',
    ];


    /**
     * Get status label by value
     *
     * @param int $status
     * @return string
     */
    public static function getLabel(int $status): string
    {
        return self::LABELS[$status] ?? 'Unknown';
    }


    public static function getColor(int $status): string
    {
        return self::COLORS[$status] ?? 'default';
    }

    /**
     * Get status value by label
     *
     * @param string $label
     * @return int|null
     */
    public static function getValueByLabel(string $label): ?int
    {
        $flipped = array_flip(self::LABELS);
        return $flipped[$label] ?? null;
    }
}
