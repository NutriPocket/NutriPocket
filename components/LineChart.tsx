import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Svg, { Line, Path, Circle, G, Text as SvgText } from "react-native-svg";

/**
 * Determina si se deben mostrar puntos en el gráfico basado en el rango de fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @param threshold - Umbral en días (por defecto 45)
 * @returns boolean - true si se deben mostrar puntos
 */
export function shouldShowPoints(
  startDate: Date,
  endDate: Date,
  threshold: number = 45
): boolean {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < threshold;
}

// Helper for generating daily points for the chart
export function generateDailyPoints(
  stats: { date: Date; count: number }[] | null,
  start: Date,
  end: Date
): LineChartDataPoint[] {
  if (!stats) return [];
  const statMap = new Map(
    stats.map((stat) => [new Date(stat.date).setHours(0, 0, 0, 0), stat.count])
  );
  const points = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (current <= endDay) {
    const ts = current.getTime();
    points.push({
      x: ts,
      y: statMap.get(ts) ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }
  return points;
}

export type LineChartDataPoint = {
  x: number;
  y: number;
};

export type LineChartSeries = {
  label: string;
  color: string;
  data: LineChartDataPoint[];
  showPoints?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
};

export type LineChartProps = {
  title: string;
  series: LineChartSeries[];
  width?: number;
  height?: number;
  yLabel?: string;
  showAllXLabels?: boolean;
  xLabelSteps?: number;
  showAllYLabels?: boolean;
  yLabelSteps?: number;
  titleColor?: string;
  renderXLabel?: (x: number) => string;
};

export default function LineChart({
  title,
  series,
  width = 340,
  height = 220,
  yLabel,
  showAllXLabels = false,
  xLabelSteps = 5,
  showAllYLabels = false,
  yLabelSteps = 3,
  titleColor = "#888", // por defecto gris
  renderXLabel = (x: number) => {
    return String(x);
  },
}: LineChartProps) {
  const theme = useTheme();
  // Unificar todos los puntos X
  const allX = Array.from(
    new Set(series.flatMap((s) => s.data.map((d) => d.x)))
  ).sort((a, b) => a - b);
  // Escala Y global
  const allY = series.flatMap((s) => s.data.map((d) => d.y));
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  // Margen para ejes y labels
  const margin = 32;
  // chartW y chartH se calculan en px, pero el SVG se ajusta al 100% del contenedor
  // Por eso, el SVG debe tener width="100%" y el View debe tener style={{ width: '100%' }}
  const chartW = width - margin * 2; // valor base para proporción
  const chartH = height - margin * 2;

  // Escala X basada en valores, no en cantidad de puntos
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);

  // Función para escalar X (ahora depende del valor, no del índice)
  const getX = (x: number) => {
    if (xMax === xMin) return margin + chartW / 2;
    return margin + ((x - xMin) / (xMax - xMin)) * chartW;
  };
  // Función para escalar Y
  const getY = (y: number) => {
    if (yMax === yMin) return margin + chartH / 2;
    return margin + chartH - ((y - yMin) / (yMax - yMin)) * chartH;
  };

  // Para labels de X: todos o solo algunos
  let xLabelIndexes: number[];
  if (showAllXLabels || allX.length <= 1) {
    xLabelIndexes = allX.map((_, i) => i);
  } else {
    const steps = Math.min(xLabelSteps, allX.length);
    xLabelIndexes = Array.from({ length: steps }, (_, i) =>
      steps === 1 ? 0 : Math.round((i * (allX.length - 1)) / (steps - 1))
    );
  }

  // Para labels de Y: todos o solo algunos
  let yLabelValues: number[];
  if (showAllYLabels || yMin === yMax) {
    yLabelValues = Array.from(new Set(allY)).sort((a, b) => b - a);
  } else {
    const steps = Math.max(2, yLabelSteps);
    yLabelValues = Array.from(
      { length: steps },
      (_, i) => yMin + ((yMax - yMin) * (steps - 1 - i)) / (steps - 1)
    );
  }

  return (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: "#f5f5f5", width: "100%" },
      ]}
    >
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <View style={{ width: "100%" }}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Ejes */}
          <G>
            {/* Eje X */}
            <Line
              x1={margin}
              y1={height - margin}
              x2={width - margin}
              y2={height - margin}
              stroke="#888"
              strokeWidth={1}
            />
            {/* Eje Y */}
            <Line
              x1={margin}
              y1={margin}
              x2={margin}
              y2={height - margin}
              stroke="#888"
              strokeWidth={1}
            />
          </G>
          {/* Líneas de datos */}
          {series.map((serie) => (
            <Path
              key={serie.label}
              d={serie.data
                .map((d, i) => {
                  const x = getX(d.x);
                  const y = getY(d.y);
                  return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={serie.color}
              strokeWidth={serie.strokeWidth ?? 2}
              strokeDasharray={serie.strokeDasharray}
            />
          ))}
          {/* Puntos de datos */}
          {series
            .filter((serie) => serie.showPoints)
            .map((serie) =>
              serie.data.map((d, i) => (
                <Circle
                  key={`${serie.label}-point-${i}`}
                  cx={getX(d.x)}
                  cy={getY(d.y)}
                  r={4}
                  fill={serie.color}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))
            )}
          {/* Labels de eje Y */}
          {yLabelValues.map((yValue, i) => (
            <SvgText
              key={i}
              x={margin - 10}
              y={getY(yValue) + 4}
              fontSize={12}
              fill="#888"
              textAnchor="end"
              alignmentBaseline="middle"
              fontWeight={
                i === 0 || i === yLabelValues.length - 1 ? "bold" : "normal"
              }
            >
              {Number(yValue.toFixed(1))}
            </SvgText>
          ))}
          {/* Labels de eje X */}
          {xLabelIndexes.map((i) => {
            const x = allX[i];
            return (
              <SvgText
                key={i}
                x={getX(x)}
                y={height - margin + 22}
                fontSize={12}
                fill="#888"
                textAnchor="middle"
                alignmentBaseline="hanging"
                fontWeight={
                  i === 0 || i === allX.length - 1 ? "bold" : "normal"
                }
              >
                {renderXLabel(x)}
              </SvgText>
            );
          })}
          {/* Label de eje Y principal ARRIBA */}
          {yLabel && (
            <SvgText
              x={margin - 10}
              y={margin - 12}
              fontSize={13}
              fill="#888"
              textAnchor="end"
              alignmentBaseline="middle"
              fontWeight="bold"
            >
              {yLabel}
            </SvgText>
          )}
        </Svg>
      </View>
      {/* Leyendas */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          marginTop: 8,
          justifyContent: "center",
        }}
      >
        {series.map((serie) => (
          <View
            key={serie.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Svg width={20} height={6} style={{ marginRight: 2 }}>
              <Line
                x1={2}
                y1={3}
                x2={18}
                y2={3}
                stroke={serie.color}
                strokeWidth={serie.strokeWidth ?? 3}
                strokeDasharray={serie.strokeDasharray}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={{ fontSize: 12 }}>{serie.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "left",
  },
});
