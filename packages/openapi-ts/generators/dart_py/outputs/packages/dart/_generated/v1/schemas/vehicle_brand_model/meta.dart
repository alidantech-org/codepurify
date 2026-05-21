import 'package:collection/collection.dart';

class VehicleBrandModelMeta {
  final num? founded;
  final String? headquarters;
  final String? country;
  final String? website;
  final String? parentBrand;
  final List<String>? regions;

  const VehicleBrandModelMeta({
    this.founded,
    this.headquarters,
    this.country,
    this.website,
    this.parentBrand,
    this.regions,
  });

  VehicleBrandModelMeta copyWith({
    num? founded,
    String? headquarters,
    String? country,
    String? website,
    String? parentBrand,
    List<String>? regions,
  }) {
    return VehicleBrandModelMeta(
      founded: founded ?? this.founded,
      headquarters: headquarters ?? this.headquarters,
      country: country ?? this.country,
      website: website ?? this.website,
      parentBrand: parentBrand ?? this.parentBrand,
      regions: regions ?? this.regions,
    );
  }

  factory VehicleBrandModelMeta.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleBrandModelMeta(
      founded: map['founded'] == null
          ? null
          : num.tryParse(map['founded'].toString()),
      headquarters: map['headquarters']?.toString(),
      country: map['country']?.toString(),
      website: map['website']?.toString(),
      parentBrand: map['parentBrand']?.toString(),
      regions: map['regions'] == null
          ? null
          : ((map['regions'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (founded != null) 'founded': founded,
      if (headquarters != null) 'headquarters': headquarters,
      if (country != null) 'country': country,
      if (website != null) 'website': website,
      if (parentBrand != null) 'parentBrand': parentBrand,
      if (regions != null) 'regions': regions,
    };
  }

  @override
  String toString() {
    return 'VehicleBrandModelMeta('
        'founded: $founded, '
        'headquarters: $headquarters, '
        'country: $country, '
        'website: $website, '
        'parentBrand: $parentBrand, '
        'regions: $regions'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is VehicleBrandModelMeta &&
        other.founded == founded &&
        other.headquarters == headquarters &&
        other.country == country &&
        other.website == website &&
        other.parentBrand == parentBrand &&
        equality.equals(other.regions, regions);
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      founded,
      headquarters,
      country,
      website,
      parentBrand,
      equality.hash(regions),
    ]);
  }
}
