import { Box, Button, Checkbox, Input, Typography } from "@mui/joy"
import { Download, ScissorsLineDashed, Undo2 } from "lucide-react"
import { DragEvent, ChangeEvent, useRef, useState, useEffect } from "react"
import Cut from "./components/Cut"
import Main from "./components/Main"
import {saveAs} from "file-saver"

const uuid = () => "xxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});

const App = () => {
	const [cuts, setCuts] = useState<string[]>([])

	const [backgroundColor, setBackgroundColor] = useState("#ffffff")
	const handleBackgroundColor = (event: ChangeEvent<HTMLInputElement>) => {
		setBackgroundColor(event.target.value || "white")
	}

	const inputRef = useRef<HTMLInputElement>(null)
	const cutsRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [file, setFile] = useState<File | null>(null)
	const [image, setImage] = useState<HTMLImageElement | null>(null)
	const handleOnInput = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files? event.target.files[0] : null
		file && setFile(file)
	}
	const handleOnDrag = (event: DragEvent<HTMLInputElement>) => {
		event.preventDefault()
	}
	const handleOnDrop = (event: DragEvent<HTMLInputElement>) => {
		event.preventDefault()
		event.stopPropagation()

		const file = event.dataTransfer!.files[0]
		setFile(file)
	}
	useEffect(() => {
		if (!file || !canvasRef.current) {
			return
		}

		const context = canvasRef.current?.getContext("2d")

		var img = new Image()
		img.onload = () => {
			canvasRef.current!.height = img.naturalHeight
			canvasRef.current!.width = img.naturalWidth

			context?.drawImage(img, 0, 0)

			setImage(img)
		}
		img.src = URL.createObjectURL(file)
	}, [file])

	const [backgroundCrop, setBackgroundCrop] = useState(false)

	const handleRemoveCut = (id: string) => {
		setCuts(
			[...cuts].filter(cutId => cutId !== id)
		)
	}
	const handleAddCut = () => {
		const id = uuid()

		setCuts([
			...cuts,
			id
		])
	}

	const handleDownload = () => {
		if (!image) {
			return
		}

		const container = cutsRef.current!.getBoundingClientRect()

		cuts.forEach((id, i) => {
			const node = document!.getElementById(`${id}`)
			const dimensions = node!.getBoundingClientRect()

			let w = node!.clientWidth + 8
			let h = node!.clientHeight + 8
			let x = -(container.left - dimensions.left)
			let y = -(container.top - dimensions.top)

			const canvas = document.createElement("canvas")
			const context = canvas.getContext("2d") as CanvasRenderingContext2D
			
			if (backgroundCrop) {
				const iW = image!.naturalWidth
				const iH = image!.naturalHeight

				x = (x < 0) ? 0 : x
				y = (y < 0) ? 0 : y
				w = (w + x > iW) ? (iW - x) : w
				h = (h + y > iH) ? (iH - y) : h
			}

			canvas.width = w
			canvas.height = h
			context.fillStyle=backgroundColor
			context.fillRect(0, 0, w, h)
			context.drawImage(image, -x, -y)

			canvas.toBlob(blob => {
				if (!blob) {
					return
				}

				saveAs(blob, `${file!.name} (cut ${i+1}).png`)
			})
		})
	}

	return (
		<Main>
			<input
				ref={inputRef}
				type="file"
				style={{"display":"none"}}
				onChange={handleOnInput}
			/>

			{!file ? (
				<Box
					component="div"
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						placeContent: "center",
						margin: 3,
						padding: 3,
						borderRadius: 8,
						border: "4px dotted",
						borderColor: "primary.500",
						textAlign: "center",
						cursor: "pointer"
					}}
					onClick={() => inputRef.current?.click()}
					onDragOver={handleOnDrag}
					onDrop={handleOnDrop}
				>
					<Typography
						color="primary"
						level="title-lg"
					>
						Click or Drag an image here
					</Typography> 
				</Box>
			) : (
				<>
					<Box
						component="header"
						sx={{
							position: "fixed",
							top: 0,
							left: 0,
							padding: 3,
							height: "96px",
							gap: 3,
							width: "100%",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							zIndex: 9999,
							backgroundColor: "primary.50"
						}}
					>
						<Button
							color="neutral"
							startDecorator={<Undo2 />}
							onClick={() => inputRef.current?.click()}
							>
							Use new image
						</Button>

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1
							}}
						>
							<Button
								color="success"
								startDecorator={<ScissorsLineDashed />}
								onClick={handleAddCut}
							>
								Add cut
							</Button>

							<Input
								value={backgroundColor}
								type="color"
								placeholder="Background color"
								onChange={handleBackgroundColor}
								size="sm"
							/>

							<Checkbox
								label="Cuts within image"
								size="sm"
								onChange={() => setBackgroundCrop(!backgroundCrop)}
							/>
						</Box>

						<Button
							startDecorator={<Download />}
							onClick={handleDownload}
							disabled={cuts.length === 0}
						>
							Download Images
						</Button>
					</Box>

					<Box
						sx={{
							backgroundColor,
							marginTop: 12,
							padding: 3,
							display: "flex",
						}}
					>
						<Box
							ref={cutsRef}
							sx={{
								margin: "0 auto",
								position: "relative"
							}}
						>
							{cuts.map(id => (
								<Cut
									key={id}
									id={id}
									onRemove={() => handleRemoveCut(id)}
								/>
							))}
							<Box
								component="canvas"
								ref={canvasRef}
								sx={{
									pointerEvents: "none"
								}}
							/>
						</Box>

					</Box>
				</>
			)}
		</Main>
	)
}

export default App
