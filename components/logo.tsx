import React from "react";
import Svg, {
    Circle,
    G,
    Path,
    Rect,
} from "react-native-svg";

export default function Logo({
    width = 200,
    height = 200,
}: {
    width?: number;
    height?: number;
}) {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
        >
            <Circle
                cx="100"
                cy="100"
                r="90"
                fill="#EBF8FF"
            />

            <G
                transform="translate(62, 50) scale(1.3)"
                opacity={0.3}
            >
                <Path
                    d="M29 6V74"
                    stroke="#4299E1"
                    strokeWidth={4}
                    strokeLinecap="round"
                />

                <Path
                    d="M48 18.5C48 11.5 41.5 11.5 29 11.5C14.5 11.5 10 16 10 24C10 38 48 33.5 48 48C48 56 41.5 60.5 29 60.5C14.5 60.5 10 52.5 10 46"
                    stroke="#4299E1"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>

            <G transform="translate(68, 65)">
                <Rect
                    x="0"
                    y="40"
                    width="16"
                    height="30"
                    rx="4"
                    fill="#63B3ED"
                />

                <Rect
                    x="24"
                    y="20"
                    width="16"
                    height="50"
                    rx="4"
                    fill="#4299E1"
                />

                <Rect
                    x="48"
                    y="0"
                    width="16"
                    height="70"
                    rx="4"
                    fill="#3182CE"
                />
            </G>
        </Svg>
    );
}