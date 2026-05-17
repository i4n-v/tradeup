<?php

namespace App\Http\Requests\Api\V1\Trades;

use Illuminate\Foundation\Http\FormRequest;

class SellRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'amountBtc' => ['required', 'string', 'decimal:0,8', 'gt:0'],
        ];
    }
}
