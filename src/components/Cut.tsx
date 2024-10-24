import { Box, IconButton } from "@mui/joy"
import { Grip, X } from "lucide-react"
import { DraggableData, Rnd } from "react-rnd"

type ResizeDirection = "top" | "right" | "bottom" | "left" | "topRight" | "bottomRight" | "bottomLeft" | "topLeft"
export type CutType = {
	id: string
	x: number
	y: number
	width: number
	height: number
}

type CutProps = CutType & {
	onRemove: () => void
	onMove: (x: number, y: number) => void
	onResize: (x: number, y: number, width: number, height: number) => void
}

export const CUT_SIZE=150

const Cut = ({
	id, 
	onRemove,
	onMove,
	onResize,
	x,
	y,
	width,
	height
}: CutProps) => {

	return (
		<Box
			id={id}
			component={Rnd}
			default={{
				x,
				y,
				width,
				height
			}}
			sx={{
				position: "relative",
				transition: `
					background-color ease .2s,
					backdrop-filter ease .2s,
					border-color ease .2s,
					color ease .2s
				`,
				backgroundColor: "transparent",
				backdropFilter: "brightness(0.9)",
				border: "4px solid",
				borderColor: "primary.500",
				color: "transparent",

				"&:hover": {
					backgroundColor: "rgba(199, 233, 247, 0.5)",
					backdropFilter: "brightness(1.2)",
					borderColor: "primary.500",
					color: "primary.500",
				}
			}}
			onDragStop={(_:any, d: DraggableData) => onMove(
				d.lastX + d.deltaX,
				d.lastY + d.deltaY
			)}
			onResizeStop={(_:any, direction: ResizeDirection, elementRef:HTMLElement, delta: {width: number, height: number}) => {
				switch (direction) {
					case "bottom":
						onResize(
							x,
							y,
							width,
							height + delta.height
						)
						break
					case "left":
						onResize(
							x - delta.width,
							y,
							width + delta.width,
							height
						)
						break
					case "right":
						onResize(
							x,
							y,
							width + delta.width,
							height
						)
						break
					case "top":
						onResize(
							x,
							y - delta.height,
							width,
							height + delta.height
						)
						break
					case "topLeft":
						onResize(
							x - delta.width,
							y - delta.height,
							width + delta.width,
							height + delta.height
						)
						break
					case "topRight":
						onResize(
							x,
							y - delta.height,
							width + delta.width,
							height + delta.height
						)
						break
					case "bottomLeft":
						onResize(
							x - delta.width,
							y,
							width + delta.width,
							height
						)
						break
					case "bottomRight":
						onResize(
							x,
							y,
							width + delta.width,
							height
						)
						break
				}
			}}
		>
			<IconButton
				color="primary"
				variant="solid"
				sx={{
					position: "absolute",
					top: -20,
					left: -20,
					zIndex: 1
				}}
				onClick={onRemove}
			>
				<X />
			</IconButton>

			<Box
				component={Grip}
				sx={{
					position: "absolute",
					top: 8,
					right: 8,
				}}
			/>
			<Box
				component={Grip}
				sx={{
					position: "absolute",
					bottom: 8,
					right: 8,
				}}
			/>

			<Box
				component={Grip}
				sx={{
					position: "absolute",
					bottom: 8,
					left: 8,
				}}
			/>
		</Box>
	)
}

export default Cut
