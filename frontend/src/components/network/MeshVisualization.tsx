import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Node,
  Edge,
} from 'reactflow';

import 'reactflow/dist/style.css';

type Device = {
  deviceId: string;
  hasInternet: boolean;
  packetCount: number;
};

type MeshState = {
  devices: Device[];
  idempotencyCacheSize: number;
};

type Props = {
  state: MeshState;
  packetId: string | null;
  ttl: number;
  hopCount: number;
  loading?: boolean;
  onGossip: () => void;
};

export default function MeshVisualization({
  state,
  packetId,
  ttl,
  hopCount,
  loading = false,
  onGossip,
}: Props) {
  const totalPackets = state.devices.reduce(
    (sum, device) => sum + device.packetCount,
    0,
  );

  const onlineDevices = useMemo(
    () => state.devices.filter(d => d.hasInternet).length,
    [state.devices]
  );

  const hasPacket =
    packetId !== null && totalPackets > 0;

  const nodeStyle = {
    background: '#111827',
    color: '#F8FAFC',
    border: '2px solid rgba(59,130,246,0.4)',
    borderRadius: '18px',
    padding: '12px',
    minWidth: 180,
    boxShadow:
      '0 0 25px rgba(59,130,246,.15)',
  };

  const nodes: Node<any>[] = useMemo(
    () => [
      {
        id: 'alice',
        position: { x: 50, y: 220 },
        data: {
          label: (
            <div>
              <div className="font-semibold">
                📱 Alice Phone
              </div>

              <div className="mt-1 text-xs text-cyan-300">
                {totalPackets} packet(s)
              </div>
            </div>
          ),
        },
        style: nodeStyle,
      },

      {
        id: 's1',
        position: { x: 300, y: 80 },
        data: {
          label: (
            <div>
              <div className="font-semibold">
                📱 Stranger 1
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Relay Node
              </div>
            </div>
          ),
        },
        style: nodeStyle,
      },

      {
        id: 's2',
        position: { x: 550, y: 80 },
        data: {
          label: (
            <div>
              <div className="font-semibold">
                📱 Stranger 2
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Relay Node
              </div>
            </div>
          ),
        },
        style: nodeStyle,
      },

      {
        id: 's3',
        position: { x: 550, y: 360 },
        data: {
          label: (
            <div>
              <div className="font-semibold">
                📱 Stranger 3
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Relay Node
              </div>
            </div>
          ),
        },
        style: nodeStyle,
      },

      {
        id: 'bridge',
        position: { x: 900, y: 220 },
        data: {
          label: (
            <div>
              <div className="font-semibold text-green-300">
                🌐 Bridge Node
              </div>

              <div className="mt-1 text-xs text-green-400">
                Internet Connected
              </div>

              <div className="mt-2 inline-flex rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-300">
                ACTIVE
              </div>
            </div>
          ),
        },
        style: {
          ...nodeStyle,
          background: '#052e16',
          border: '2px solid #22C55E',
          boxShadow:
            '0 0 35px rgba(34,197,94,.35)',
        },
      },
    ],
    [totalPackets],
  );

  const edgeStyle = {
    stroke: '#3B82F6',
    strokeWidth: 2,
  };

  const edges: Edge[] = [
    {
      id: 'e1',
      source: 'alice',
      target: 's1',
      animated: true,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },

    {
      id: 'e2',
      source: 's1',
      target: 's2',
      animated: true,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },

    {
      id: 'e3',
      source: 's2',
      target: 'bridge',
      animated: true,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },

    {
      id: 'e4',
      source: 's2',
      target: 's3',
      animated: true,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },

    {
      id: 'e5',
      source: 's3',
      target: 'bridge',
      animated: true,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
  ];

  return (
    <div className="relative h-[550px] overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="absolute right-[120px] top-[220px] h-24 w-24 rounded-full bg-green-500 blur-3xl pointer-events-none"
      />

      {hasPacket && (
        <>
          <motion.div
            animate={{
              left: ['9%', '26%', '46%', '80%'],
              top: ['68%', '26%', '26%', '48%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute z-50 h-5 w-5 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,.9)]"
          />

          <motion.div
            animate={{
              left: ['9%', '26%', '46%', '80%'],
              top: ['68%', '26%', '26%', '48%'],
              opacity: [0.15, 0.6, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute z-40 h-10 w-10 rounded-full bg-cyan-400/20 blur-xl"
          />
        </>
      )}

      <div className="absolute left-4 top-4 rounded-xl border border-cyan-500/20 bg-black/40 p-4 backdrop-blur-xl">
        <div className="text-xs uppercase tracking-wider text-slate-400">
          Packet Status
        </div>

        <div className="mt-2 text-sm text-cyan-300">
          {packetId
            ? packetId.slice(0, 12)
            : 'No Active Packet'}
        </div>

        <div className="mt-2 text-xs text-slate-400">
          TTL: {ttl}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          Hop Count: {hopCount}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          Online Devices: {onlineDevices}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          Cache Entries: {state.idempotencyCacheSize}
        </div>
      </div>

      <button
        onClick={onGossip}
        disabled={loading}
        className="absolute bottom-4 right-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
      >
        {loading ? 'Running...' : 'Run Gossip Round'}
      </button>
    </div>
  );
}