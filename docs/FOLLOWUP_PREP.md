# Follow-up Preparation

## 1. Why YOLOv11?
YOLO11 represents the cutting edge of real-time object detection. Compared to older versions (v8/v9/v10), it features improved backbone architectures and enhanced neck designs that focus on both small and large objects equally well. Its "anchor-free" approach simplifies the pipeline and improves generalization across different retail layouts.

## 2. Why ByteTrack?
Most trackers lose performance when objects overlap (occlusion). ByteTrack excels here by using a two-stage association strategy. First, it matches high-confidence detections. Then, it attempts to match lower-confidence detections (which might be partially occluded people) using spatial proximity. This significantly reduces Identity Switches (IDSw) in crowded stores.

## 3. Why TorchReID (OSNet)?
While tracking handles movement across subsequent frames, ReID handles identity across different camera views or after a subject leaves and re-enters the store. OSNet is specifically designed for person ReID, featuring "Omni-Scale" residual blocks that capture both global and local features (like a logo on a shirt vs. the overall color of the pants).

## 4. Failure Scenarios
- **Drastic Lighting Changes**: Can cause detection confidence to drop.
- **Extreme Crowding**: When many people overlap, ByteTrack might still swap IDs if the gap is too large.
- **Uniform Appearances**: Staff in uniforms or customers in similar clothing can confuse the ReID model.
- **Stale Feed**: Network latency or RTSP artifacts can lead to "ghost" tracks or missed detections.

## 5. Scalability Concerns
- **GPU Bottleneck**: YOLO and ReID are GPU-intensive. Scaling to 100+ stores requires either powerful edge nodes or a distributed cloud inference cluster.
- **Database Write Load**: Ingesting thousands of events per second requires partition strategies in PostgreSQL and optimized Redis clusters.

## 6. Trade-offs
- **Accuracy vs. Latency**: Higher resolution images improve detection of small items/distant people but increase inference time.
- **Storage Cost**: Storing every raw event is expensive; we aggregate data into daily/hourly metrics to save space while keeping detailed logs for only a limited window.
