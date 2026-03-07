import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const seededRestaurants = [
  {
    id: '1',
    name: 'Harvest Table',
    address: '112 W Main St',
    category: 'Farm-to-table',
    distance: 2.1,
  },
  {
    id: '2',
    name: 'Lakeview Bistro',
    address: '57 Lakeshore Blvd',
    category: 'Contemporary',
    distance: 3.4,
  },
  {
    id: '3',
    name: 'Pine Street Diner',
    address: '720 Pine St',
    category: 'Classic American',
    distance: 1.8,
  },
];

export default function RestaurantPicker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const guestId = searchParams.get('guestId');

  const header = useMemo(() => {
    if (guestId) {
      return `Invite guest ${guestId} to dinner`;
    }
    return 'Book a sit-down restaurant';
  }, [guestId]);

  return (
    <Layout showTrust>
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Restaurants</p>
          <h1 className="text-3xl font-semibold text-slate-900">{header}</h1>
        </header>
        <div className="space-y-4">
          {seededRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-slate-900">{restaurant.name}</p>
                  <p className="text-sm text-slate-500">{restaurant.category}</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{restaurant.address}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-sm font-semibold text-slate-900">{restaurant.distance} mi</p>
                  <button
                    onClick={() =>
                      navigate(`/invitations/create?guestId=${guestId ?? ''}&restaurantId=${restaurant.id}`)
                    }
                    className="rounded-2xl bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
