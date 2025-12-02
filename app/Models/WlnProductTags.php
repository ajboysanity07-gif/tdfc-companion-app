<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WlnProductTags extends Model
{
    protected $table = 'wln_product_tags';
    public $timestamps = true;
    protected $primaryKey = null;
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'product_id',
        'typecode'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(WlnProducts::class, 'product_id', 'product_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function type()
    {
        return $this->belongsTo(WlnType::class, 'typecode', 'typecode');
    }
}
