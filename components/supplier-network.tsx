import { useCallback, useEffect, useState, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeProps,
  ConnectionMode,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface SupplierNode {
  id: string
  name: string
  compliance_status: {
    lksg?: 'Compliant' | 'Partially Compliant' | 'Non-Compliant'
    cbam?: string
    csdd?: string
    csrd?: string
    reach?: string
  }
}

interface SupplierRelation {
  user: string
  supplier: string
}

// Custom node component defined outside
const SupplierNodeComponent = ({ data }: NodeProps<SupplierNode>) => {
  const nodeId = `supplier-${data.id}`
  const descriptionId = `desc-${nodeId}`
  const complianceStatus = data.compliance_status?.lksg || 'Unknown'
  
  return (
    <div 
      className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-slate-200 cursor-pointer min-w-[150px]"
      role="button"
      aria-labelledby={nodeId}
      aria-describedby={descriptionId}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        id={`${nodeId}-target`}
        aria-label="Connection target point"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id={`${nodeId}-source`}
        aria-label="Connection source point"
      />
      <div id={nodeId} className="font-bold text-sm">{data.name}</div>
      <div 
        id={descriptionId}
        className={`text-xs mt-1 ${
          complianceStatus === 'Compliant' ? 'text-green-600' :
          complianceStatus === 'Partially Compliant' ? 'text-yellow-600' :
          'text-red-600'
        }`}
      >
        {complianceStatus}
      </div>
    </div>
  )
}

// Node types defined outside
const nodeTypes = {
  supplier: SupplierNodeComponent
}

// Default edge options defined outside
const defaultEdgeOptions = {
  style: { strokeWidth: 2 },
  type: 'smoothstep',
  animated: true,
}

export function SupplierNetwork() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  const fetchSupplierNetwork = useCallback(async () => {
    try {
      if (!user) {
        console.error('No authenticated user')
        return
      }

      setNodes([])
      setEdges([])

      // First get the user's company from user_supplier_association
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_supplier_association')
        .select('supplier')
        .eq('user', user.id)
        .single()

      if (userCompanyError) throw userCompanyError
      if (!userCompany) {
        console.error('No company found for user')
        return
      }

      // Get the company details
      const { data: company, error: companyError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', userCompany.supplier)
        .single()

      if (companyError) throw companyError
      if (!company) {
        console.error('Company details not found')
        return
      }

      // Get all suppliers from user_supplier_lists where the user is either the user or supplier
      const { data: relationships, error: relationshipsError } = await supabase
        .from('user_supplier_lists')
        .select('user, supplier')
        .or(`user.eq.${user.id},supplier.eq.${user.id}`)

      if (relationshipsError) throw relationshipsError
      if (!relationships || relationships.length === 0) {
        console.error('No supplier relationships found')
        return
      }

      // Collect all unique supplier IDs
      const supplierIds = new Set<string>()
      relationships.forEach(rel => {
        if (rel.user !== user.id) supplierIds.add(rel.user)
        if (rel.supplier !== user.id) supplierIds.add(rel.supplier)
      })

      // Get details of all suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .in('id', Array.from(supplierIds))

      if (suppliersError) throw suppliersError
      if (!suppliers || suppliers.length === 0) {
        console.error('No suppliers found')
        return
      }

      // Create nodes
      const newNodes: Node[] = []
      const centerY = 300
      const centerX = 400

      // Add user's company node at the top
      newNodes.push({
        id: userCompany.supplier,
        type: 'supplier',
        data: company,
        position: { x: centerX, y: centerY - 100 },
      })

      // Filter out suppliers with the same name as the root company
      const uniqueSuppliers = suppliers.filter(supplier => 
        supplier.name !== company.name
      )

      // Position suppliers below the user
      const suppliersPerRow = 3
      const horizontalSpacing = 200
      const verticalSpacing = 150
      
      uniqueSuppliers.forEach((supplier, index) => {
        const row = Math.floor(index / suppliersPerRow)
        const col = index % suppliersPerRow
        const startX = centerX - ((suppliersPerRow - 1) * horizontalSpacing) / 2
        
        newNodes.push({
          id: supplier.id,
          type: 'supplier',
          data: supplier,
          position: {
            x: startX + (col * horizontalSpacing),
            y: centerY + (row * verticalSpacing),
          },
        })
      })

      setNodes(newNodes)

      // Create edges based on relationships, excluding edges to duplicate nodes
      const newEdges: Edge[] = []
      const processedEdges = new Set<string>()

      relationships.forEach(rel => {
        // Skip relationships where either end is a duplicate of the root company
        const sourceSupplier = suppliers.find(s => s.id === rel.user)
        const targetSupplier = suppliers.find(s => s.id === rel.supplier)
        
        if (sourceSupplier?.name === company.name || targetSupplier?.name === company.name) {
          return
        }

        const edgeId = `${rel.user}-${rel.supplier}`
        if (!processedEdges.has(edgeId)) {
          processedEdges.add(edgeId)
          newEdges.push({
            id: edgeId,
            source: rel.user,
            target: rel.supplier,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
          })
        }
      })

      // Add edges from root company to its direct suppliers
      uniqueSuppliers.forEach(supplier => {
        const edgeId = `${userCompany.supplier}-${supplier.id}`
        if (!processedEdges.has(edgeId)) {
          processedEdges.add(edgeId)
          newEdges.push({
            id: edgeId,
            source: userCompany.supplier,
            target: supplier.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
          })
        }
      })

      setEdges(newEdges)

    } catch (error) {
      console.error('Error fetching supplier network:', error)
    } finally {
      setLoading(false)
    }
  }, [setNodes, setEdges, user])

  useEffect(() => {
    if (user) {
      fetchSupplierNetwork()
    }
  }, [fetchSupplierNetwork, user])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const supplierName = (node.data as SupplierNode).name
    router.push(`/profile/${encodeURIComponent(supplierName)}`)
  }, [router])

  if (!user) {
    return (
      <div 
        className="flex items-center justify-center h-[400px]"
        role="alert"
        aria-label="Authentication required"
      >
        Please log in to view the supplier network.
      </div>
    )
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center h-[400px]"
        role="progressbar"
        aria-label="Loading supplier network"
      >
        Loading network...
      </div>
    )
  }

  return (
    <div 
      style={{ width: '100%', height: '600px' }} 
      className="border rounded-lg bg-slate-50"
      role="region"
      aria-label="Supplier network visualization"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        style={{ width: '100%', height: '100%' }}
        aria-label="Interactive supplier network diagram"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
} 