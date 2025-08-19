import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ad } from '@/types';
import { MapPin, Calendar, Eye, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdCardProps {
  ad: Ad;
  showStatus?: boolean;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, showStatus = false }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Link to={`/ads/${ad.id}`} className="block group">
      <Card className="gradient-card hover-scale transition-spring shadow-card h-full overflow-hidden group-hover:shadow-elevated">
        <div className="relative">
          {/* Image */}
          <div className="aspect-[4/3] bg-muted relative overflow-hidden">
            {ad.image_url || (ad.images && ad.images.length > 0) ? (
              <img
                src={ad.image_url || ad.images?.[0]}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-spring"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-4xl">📋</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {ad.is_featured && (
                <Badge className="bg-yellow-500 text-white shadow-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {ad.is_premium && (
                <Badge className="gradient-primary text-white shadow-sm">
                  Premium
                </Badge>
              )}
              {showStatus && (
                <Badge className={`${getStatusColor(ad.status)} text-white shadow-sm`}>
                  {ad.status}
                </Badge>
              )}
            </div>

            {/* Views count */}
            {ad.views_count && ad.views_count > 0 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {ad.views_count}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth line-clamp-2">
              {ad.title}
            </h3>

            {/* Price */}
            {ad.price && (
              <div className="text-lg font-bold text-primary">
                {formatPrice(ad.price)}
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground text-sm line-clamp-2">
              {ad.description}
            </p>

            {/* Location and Date */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {ad.location && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{ad.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Category */}
            {ad.category && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {ad.category.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};