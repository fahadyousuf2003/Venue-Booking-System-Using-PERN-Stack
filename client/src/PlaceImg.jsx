export default function PlaceImg({ place, index = 0, className = 'object-cover w-full h-full' }) {
    if (!place || !place.photos || !place.photos.length) {
      return null;
    }
  
    return (
      <img
        className={className}
        src={`http://localhost:4000/uploads/${place.photos[index].filename}`}
        alt={`Thumbnail for ${place.title}`}
      />
    );
  }
  