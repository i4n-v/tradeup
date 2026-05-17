<?php

namespace App\Http\Requests\Api\V1\Trades;

use Illuminate\Foundation\Http\FormRequest;

class BuyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'amountBrl' => ['required', 'string', 'decimal:0,2', 'gt:0'],
        ];
    }
}
