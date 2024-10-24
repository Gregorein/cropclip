import { Box, Button, ButtonGroup, IconButton, Tooltip, Typography } from "@mui/joy"
import { ArrowLeft, ArrowRight, Download, ScissorsLineDashed, Image as ImageIcon } from "lucide-react"
import { DragEvent, ChangeEvent, useRef, useState, useEffect } from "react"
import Cut, { CUT_SIZE, CutType } from "./components/Cut"
import Main from "./components/Main"
import {saveAs} from "file-saver"

const uuid = () => "xxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0, v = c === "x" ? r : ((r & 0x3) | 0x8);
		return v.toString(16);
	});

const App = () => {
	const [cuts, setCuts] = useState<CutType[][]>([])

	const inputRef = useRef<HTMLInputElement>(null)
	const cutsRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [files, setFiles] = useState<File[]>([])
	const handleReceivedFiles = (files: File[]) => {
		setFiles(files)
		setCuts(
			Array(files.length).fill([])
		)
	}
	const [image, setImage] = useState<HTMLImageElement | null>(null)
	const [activeImageIndex, setActiveImageIndex] = useState(0)
	const handleNextImage = () => {
		setActiveImageIndex(
			(activeImageIndex + 1) % files.length
		)
	}
	const handlePrevImage = () => {
		setActiveImageIndex(
			(activeImageIndex - 1 + files.length) % files.length
		)
	}

	const handleOnInput = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) {
			return
		}

		handleReceivedFiles(
			Array.from(event.target.files)
		)
	}
	const handleOnDrag = (event: DragEvent<HTMLInputElement>) => {
		event.preventDefault()
	}
	const handleOnDrop = (event: DragEvent<HTMLInputElement>) => {
		event.preventDefault()
		event.stopPropagation()

		handleReceivedFiles(Array.from(event.dataTransfer!.files))
	}

	useEffect(() => {
		if (!files || !canvasRef.current) {
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
		img.src = URL.createObjectURL(files[activeImageIndex])
	}, [files, activeImageIndex])

	const handleRemoveCut = (cutId: string) => {
		if (cuts.length !== files.length) {
			throw new Error("var cuts length is not equal to var files length")
		}
		setCuts((cuts) => {
			const newCuts = [...cuts]

			newCuts[activeImageIndex] = newCuts[activeImageIndex].filter(({id,...rest}) => cutId !== id)

			return newCuts
		})
	}
	const handleAddCut = () => {
		const id = uuid()

		setCuts((cuts) => {
			const newCuts = [...cuts]

			newCuts[activeImageIndex] = [
				...newCuts[activeImageIndex],
				{
					id,
					x: (cutsRef.current!.clientWidth/2) + window.scrollX - CUT_SIZE,
					y: window.innerHeight/2 + window.scrollY - CUT_SIZE,
					width: CUT_SIZE *2,
					height: CUT_SIZE *2,
				}
			]

			return newCuts
		})
	}
	const handleMoveCut = (cutId: string, x: number, y: number) => {
		setCuts((cuts) => {
			const newCuts = [...cuts]

			newCuts[activeImageIndex] = newCuts[activeImageIndex].map(cut => {
				const {id, ...rest} = cut
				if (cutId !== id) {
					return cut
				}

				return {
					id,
					...rest,
					x,
					y
				}
			})

			return newCuts
		})
	}
	const handleResizeCut = (cutId: string, x: number, y: number, width: number, height: number) => {
		setCuts((cuts) => {
			const newCuts = [...cuts]

			newCuts[activeImageIndex] = newCuts[activeImageIndex].map(cut => {
				const {id} = cut
				if (cutId !== id) {
					return cut
				}

				return {
					id,
					x,
					y,
					width,
					height
				}
			})

			return newCuts
		})
	}

	const handleDownload = () => {
		if (!image) {
			return
		}
		const container = cutsRef.current!.getBoundingClientRect()

		cuts[activeImageIndex].forEach(
			({
				id,
				x: cutX,
				y: cutY,
				width,
				height
			}, i) => {
			let w = width
			let h = height
			let x = cutX
			let y = cutY

			const canvas = document.createElement("canvas")
			const context = canvas.getContext("2d") as CanvasRenderingContext2D
			
			// out of bounds check
			if (x < 0) {
				w += x	
				x = 0
			}
			if (y < 0) {
				h += y	
				y = 0
			}
			if (x + w > image!.naturalWidth) {
				w = image!.naturalWidth - x
			}
			if (y + h > image!.naturalHeight) {
				h = image!.naturalHeight - y
			}

			canvas.width = w
			canvas.height = h
			context.fillStyle="white"
			context.fillRect(0, 0, w, h)
			context.drawImage(image, -x, -y)

			canvas.toBlob(blob => {
				if (!blob) {
					return
				}

				saveAs(blob, `${files[activeImageIndex]!.name} (cut ${i+1}).png`)
			})
		})
	}

	// keyboard shortcuts
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault()
				setActiveImageIndex((activeImageIndex - 1 + files.length) % files.length)
			}
			if (e.key === "ArrowRight") {
				e.preventDefault()
				setActiveImageIndex((activeImageIndex + 1) % files.length)
			}
			
			if (e.code === "Space") {
				e.preventDefault()
				handleAddCut()
			}
		}
		window.addEventListener("keydown", onKeyDown)

		return () => {
			window.removeEventListener("keydown", onKeyDown)
		}
	}, [activeImageIndex, files])

	return (
		<Main>
			<input
				ref={inputRef}
				type="file"
				style={{ display: "none" }}
				onChange={handleOnInput}
				multiple
			/>

			{files.length === 0 ? (
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
						Click or Drag an image(s) here
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
							gap: 3,
							width: "100%",
							display: "flex",
							justifyContent: "space-between",
							zIndex: 1000,
							backgroundColor: "primary.50"
						}}
					>
						<Button
							color="neutral"
							startDecorator={<ImageIcon />}
							onClick={() => inputRef.current?.click()}
							>
							Load image
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

							{files.length > 1 && (
								<ButtonGroup color="primary">
									<IconButton onClick={handlePrevImage}>
										<ArrowLeft />
									</IconButton>
									
									<Button
										sx={{
											pointerEvents: "none"
										}}
									>
										{activeImageIndex + 1} / {files.length}
									</Button>

									<IconButton onClick={handleNextImage}>
										<ArrowRight />
									</IconButton>
								</ButtonGroup>
							)}
						</Box>

						<Tooltip
							placement="bottom"
							title="Download all cuts from this image"

						>

							<Button
								startDecorator={<Download />}
								onClick={handleDownload}
								disabled={cuts.length === 0}
							>
								Download Images
							</Button>
							</Tooltip>
					</Box>

					<Box
						sx={{
							marginTop: "84px",							
							padding: 3,
							display: "flex",
							flex: 1,
						}}
					>
						<Box
							ref={cutsRef}
							sx={{
								margin: "0 auto",
								position: "relative"
							}}
						>
							{cuts[activeImageIndex].map(({id, ...otherProps}) => (
								<Cut
									key={id}
									id={id}
									{...otherProps}
									onRemove={() => handleRemoveCut(id)}
									onMove={(x, y) => handleMoveCut(id, x, y)}
									onResize={(x, y, w, h) => handleResizeCut(id, x, y, w, h)}
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
