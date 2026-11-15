import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import { ExamTime, StatusBadge } from '@/features/exams';
import examIconUrl from '@/images/exam.png';

import type { LocationGroup } from '../model/locations';
import styles from './ExamMapView.module.css';

// Leaflet's default marker images break under bundlers, so use the VICTVS exam icon.
const examIcon = L.icon({
  iconUrl: examIconUrl,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
  popupAnchor: [0, -30],
});

/** Presentational: one marker per venue. Knows nothing about loading data. */
export function ExamMapView({ groups }: { groups: readonly LocationGroup[] }) {
  // Fit the view to every venue rather than hard-coding a centre and zoom.
  const bounds = useMemo(
    () => L.latLngBounds(groups.map((g) => [g.latitude, g.longitude] as [number, number])),
    [groups],
  );

  return (
    <div className={styles.frame}>
      <MapContainer
        className={styles.map}
        bounds={bounds}
        boundsOptions={{ padding: [48, 48], maxZoom: 6 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groups.map((group) => (
          <Marker
            key={group.key}
            position={[group.latitude, group.longitude]}
            icon={examIcon}
            title={`${group.label}: ${group.exams.length} sessions`}
            alt={`${group.label}: ${group.exams.length} sessions`}
          >
            <Popup>
              <div className={styles.popup}>
                <h3>{group.label}</h3>
                <ul>
                  {group.exams.map((exam) => (
                    <li key={exam.id}>
                      <strong>{exam.title}</strong>
                      <ExamTime exam={exam} />
                      <StatusBadge status={exam.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
