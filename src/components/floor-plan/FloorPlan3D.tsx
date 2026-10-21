'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePOS } from '@/lib/store';
import { SECTIONS } from '@/lib/mockData';
import { SectionId, TableItem } from '@/types/pos';
import { sounds } from '@/lib/audio';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Clock,
  Receipt,
  Sparkles,
  Info,
  CheckCircle2,
  Utensils,
} from 'lucide-react';

export default function FloorPlan3D() {
  const {
    tables,
    currentSection,
    setCurrentSection,
    selectTableAndOpenPOS,
    getOrderByTableId,
    viewMode,
    setViewMode,
  } = usePOS();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hover state for 3D overlay tooltip
  const [hoveredTable, setHoveredTable] = useState<TableItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter tables by current section
  const sectionTables = tables.filter((t) => t.section === currentSection);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f17);
    scene.fog = new THREE.FogExp2(0x0c0f17, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 16, 18);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffe0b2, 1.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xd4af37, 1.5, 30);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    // 5. Floor Geometry (Luxury Restaurant Tile / Dark Walnut Wood)
    const floorGeo = new THREE.PlaneGeometry(28, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.6,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid lines for subtle architectural luxury texture
    const grid = new THREE.GridHelper(28, 28, 0x2a3248, 0x1b2030);
    grid.position.y = 0.02;
    scene.add(grid);

    // 6. Table Meshes Group
    const tablesGroup = new THREE.Group();
    scene.add(tablesGroup);

    const tableMeshMap = new Map<string, THREE.Object3D>();

    // Helper: Material color by status
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'occupied':
          return 0xf59e0b; // Amber
        case 'bill_requested':
          return 0xa855f7; // Electric Purple
        case 'reserved':
          return 0x3b82f6; // Blue
        case 'cleaning':
          return 0xeab308; // Yellow
        case 'empty':
        default:
          return 0x10b981; // Emerald
      }
    };

    sectionTables.forEach((table) => {
      const tableObj = new THREE.Group();
      tableObj.position.set(table.posX, 0, table.posZ);
      tableObj.userData = { tableId: table.id, table };

      const statusColor = getStatusColor(table.status);

      // Glowing Base Ring
      const ringGeo = new THREE.RingGeometry(table.shape === 'round' ? 1.4 : 1.7, table.shape === 'round' ? 1.6 : 1.9, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: statusColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: table.status === 'empty' ? 0.35 : 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      tableObj.add(ring);

      // Table Top
      let topGeo: THREE.BufferGeometry;
      if (table.shape === 'round') {
        topGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 32);
      } else {
        topGeo = new THREE.BoxGeometry(2.2, 0.15, 1.5);
      }

      const topMat = new THREE.MeshStandardMaterial({
        color: 0x222736,
        roughness: 0.3,
        metalness: 0.4,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 1.1;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      tableObj.add(topMesh);

      // Table Pedestal / Leg
      const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.1, 16);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.8, roughness: 0.2 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.y = 0.55;
      leg.castShadow = true;
      tableObj.add(leg);

      // Centerpiece: Ambient Candle / Mini Lamp
      const lampGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 12);
      const lampMat = new THREE.MeshStandardMaterial({
        color: statusColor,
        emissive: statusColor,
        emissiveIntensity: table.status !== 'empty' ? 0.9 : 0.2,
      });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.y = 1.3;
      tableObj.add(lamp);

      // Chairs around the table
      const chairCount = table.capacity;
      const radius = table.shape === 'round' ? 1.6 : 1.5;

      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * Math.PI * 2;
        const chair = new THREE.Group();

        // Chair seat
        const seatGeo = new THREE.BoxGeometry(0.45, 0.08, 0.45);
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x161a25, roughness: 0.5 });
        const seat = new THREE.Mesh(seatGeo, seatMat);
        seat.position.y = 0.55;
        seat.castShadow = true;
        chair.add(seat);

        // Chair back
        const backGeo = new THREE.BoxGeometry(0.45, 0.45, 0.06);
        const back = new THREE.Mesh(backGeo, seatMat);
        back.position.set(0, 0.8, -0.2);
        back.castShadow = true;
        chair.add(back);

        // Position & rotate towards table center
        chair.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        chair.rotation.y = -angle - Math.PI / 2;

        tableObj.add(chair);
      }

      tablesGroup.add(tableObj);
      tableMeshMap.set(table.id, tableObj);
    });

    // 7. Raycaster & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        // Orbit rotation around center
        camera.position.x = camera.position.x * Math.cos(-deltaX * 0.005) - camera.position.z * Math.sin(-deltaX * 0.005);
        camera.position.z = camera.position.x * Math.sin(-deltaX * 0.005) + camera.position.z * Math.cos(-deltaX * 0.005);
        camera.position.y = Math.max(6, Math.min(26, camera.position.y + deltaY * 0.03));
        camera.lookAt(0, 0, 0);

        prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        // Hover raycasting
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tablesGroup.children, true);

        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData.tableId) {
            topObj = topObj.parent;
          }

          if (topObj && topObj.userData.table) {
            setHoveredTable(topObj.userData.table);
            document.body.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredTable(null);
        document.body.style.cursor = 'default';
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      const movedDist = Math.hypot(e.clientX - prevMousePos.x, e.clientY - prevMousePos.y);
      isDragging = false;

      // If clicked without dragging, select table
      if (movedDist < 5) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tablesGroup.children, true);

        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData.tableId) {
            topObj = topObj.parent;
          }

          if (topObj && topObj.userData.tableId) {
            sounds.playTap();
            selectTableAndOpenPOS(topObj.userData.tableId);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.015;
      camera.position.multiplyScalar(1 + zoomFactor * 0.1);
      camera.position.clampLength(10, 40);
      camera.lookAt(0, 0, 0);
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle pulsating effect on bill_requested and occupied table lamps
      tablesGroup.children.forEach((tableObj) => {
        const lamp = tableObj.children[2] as THREE.Mesh;
        if (lamp && lamp.material instanceof THREE.MeshStandardMaterial) {
          const t = tableObj.userData.table as TableItem;
          if (t && t.status === 'bill_requested') {
            lamp.material.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 6) * 0.5;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvasEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [currentSection, sectionTables, selectTableAndOpenPOS]);

  // Order info for hovered table
  const hoveredOrder = hoveredTable ? getOrderByTableId(hoveredTable.id) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] relative overflow-hidden select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Section Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121622]/90 backdrop-blur-md border border-stone-800 shadow-xl pointer-events-auto">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                sounds.playTap();
                setCurrentSection(sec.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentSection === sec.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span>{sec.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-stone-900 font-mono">
                {tables.filter((t) => t.section === sec.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle & 3D Helpers */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center p-1 rounded-2xl bg-[#121622]/90 backdrop-blur-md border border-stone-800 shadow-xl">
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('3d');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              3D İzometrik
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('2d');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === '2d'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              2D Hızlı Liste
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Hover Tooltip Overlay */}
        {hoveredTable && (
          <div
            style={{
              left: `${Math.min(window.innerWidth - 300, Math.max(20, mousePos.x + 20))}px`,
              top: `${Math.min(window.innerHeight - 200, Math.max(70, mousePos.y - 40))}px`,
            }}
            className="absolute z-30 pointer-events-none p-3.5 rounded-2xl bg-[#121624]/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl shadow-black/80 w-64 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800/80 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-100 text-sm">{hoveredTable.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">
                  {hoveredTable.capacity} Kişilik
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  hoveredTable.status === 'occupied'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : hoveredTable.status === 'bill_requested'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : hoveredTable.status === 'reserved'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : hoveredTable.status === 'cleaning'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {hoveredTable.status === 'occupied' && 'Dolu'}
                {hoveredTable.status === 'bill_requested' && 'Hesap Bekliyor'}
                {hoveredTable.status === 'reserved' && 'Rezerve'}
                {hoveredTable.status === 'cleaning' && 'Temizleniyor'}
                {hoveredTable.status === 'empty' && 'Boş Masa'}
              </span>
            </div>

            {hoveredOrder ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-stone-300">
                  <span className="flex items-center gap-1 text-stone-400">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>Adisyon Tutarı:</span>
                  </span>
                  <span className="font-bold text-amber-400 font-mono text-sm">
                    {hoveredOrder.total.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Misafir / Garson:</span>
                  </span>
                  <span className="text-stone-200">
                    {hoveredOrder.guestCount} Kişi • {hoveredOrder.waiterName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Oturma Süresi:</span>
                  </span>
                  <span className="text-stone-300 font-mono">
                    {hoveredTable.seatedAt
                      ? `${Math.max(1, Math.round((Date.now() - new Date(hoveredTable.seatedAt).getTime()) / 60000))} dk`
                      : 'Yeni'}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-800 text-[11px] text-amber-400 font-semibold flex items-center justify-center gap-1 text-center">
                  <span>Adisyonu açmak için tıklayın →</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs text-stone-400">Masa şu anda müsait.</p>
                <p className="text-[11px] text-amber-400 font-semibold mt-1">
                  Yeni adisyon başlatmak için tıklayın →
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Legend & Quick Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Status Legend */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#121622]/90 backdrop-blur-md border border-stone-800 text-xs shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-stone-300">Boş</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-stone-300">Dolu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="text-stone-300">Hesap İstendi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span className="text-stone-300">Rezerve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
            <span className="text-stone-300">Temizleniyor</span>
          </div>
        </div>

        {/* 3D Navigation Tip */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#121622]/80 backdrop-blur-md border border-stone-800 text-[11px] text-stone-400 shadow-xl pointer-events-auto font-medium">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Sol tık sürükle: Kamerayı Döndür • Tekerlek: Yakınlaştır • Masaya Tıkla: Adisyonu Aç</span>
        </div>
      </div>
    </div>
  );
}
