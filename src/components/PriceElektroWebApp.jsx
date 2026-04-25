import { useState, useEffect } from 'react'

export default function PriceElektroWebApp() {
  const TAX_SYSTEMS = [
    'ФОП 2 група (єдиний податок)',
    'ФОП 3 група 5% без ПДВ',
    'ФОП 3 група 3% з ПДВ',
    'ТОВ на загальній системі',
    'Платник ПДВ'
  ]

  const [supplier, setSupplier] = useState(() => JSON.parse(localStorage.getItem('supplier_db')) || {
    company: 'ФОП Електромонтаж',
    edrpou: '',
    iban: '',
    bank: '',
    phone: '',
    taxSystem: TAX_SYSTEMS[0]
  })

  const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem('clients_db')) || [])
  const [materialsDb, setMaterialsDb] = useState(() => JSON.parse(localStorage.getItem('materials_db')) || [])
  const [selectedClientId, setSelectedClientId] = useState('')

  const [newClient, setNewClient] = useState({ name: '', phone: '', address: '' })
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: 'шт', price: '' })

  const [workName, setWorkName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [materialCost, setMaterialCost] = useState('')

  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('elektro_items')) || [])
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('elektro_history')) || [])

  useEffect(() => localStorage.setItem('supplier_db', JSON.stringify(supplier)), [supplier])
  useEffect(() => localStorage.setItem('clients_db', JSON.stringify(clients)), [clients])
  useEffect(() => localStorage.setItem('materials_db', JSON.stringify(materialsDb)), [materialsDb])
  useEffect(() => localStorage.setItem('elektro_items', JSON.stringify(items)), [items])
  useEffect(() => localStorage.setItem('elektro_history', JSON.stringify(history)), [history])

  const addClient = () => {
    if (!newClient.name) return
    setClients([{ id: Date.now(), ...newClient }, ...clients])
    setNewClient({ name: '', phone: '', address: '' })
  }

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.price) return
    setMaterialsDb([{ id: Date.now(), ...newMaterial, price: Number(newMaterial.price) }, ...materialsDb])
    setNewMaterial({ name: '', unit: 'шт', price: '' })
  }

  const addItem = () => {
    if (!workName || !price || !quantity) return
    const total = Number(price) * Number(quantity) + Number(materialCost || 0)
    setItems([{ id: Date.now(), name: workName, price: Number(price), quantity: Number(quantity), materials: Number(materialCost || 0), total }, ...items])
    setWorkName('')
    setPrice('')
    setQuantity('')
    setMaterialCost('')
  }

  const laborTotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const materialsTotal = items.reduce((s, i) => s + i.materials, 0)
  const grandTotal = laborTotal + materialsTotal
  const taxRate = supplier.taxSystem.includes('5%') ? 0.05 : supplier.taxSystem.includes('3%') ? 0.03 : supplier.taxSystem.includes('ПДВ') ? 0.20 : 0
  const taxAmount = Math.round(grandTotal * taxRate * 100) / 100
  const totalWithTax = grandTotal + taxAmount

  const saveInvoice = () => {
    const client = clients.find(c => String(c.id) === String(selectedClientId))
    setHistory([{ id: Date.now(), date: new Date().toLocaleString('uk-UA'), client: client?.name || '', supplier, total: grandTotal, items }, ...history])
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <h1 className='text-3xl font-bold'>Прайс Електромонтаж — PRO Business UA</h1>

        <div className='grid lg:grid-cols-3 gap-6'>
          <div className='bg-white rounded-2xl shadow p-6'>
            <h2 className='text-xl font-semibold mb-4'>Реквізити постачальника</h2>
            <div className='space-y-3'>
              <input className='w-full border rounded-xl p-3' value={supplier.company} onChange={(e)=>setSupplier({...supplier, company:e.target.value})} placeholder='Назва / ФОП' />
              <input className='w-full border rounded-xl p-3' value={supplier.edrpou} onChange={(e)=>setSupplier({...supplier, edrpou:e.target.value})} placeholder='ЄДРПОУ / ІПН' />
              <input className='w-full border rounded-xl p-3' value={supplier.iban} onChange={(e)=>setSupplier({...supplier, iban:e.target.value})} placeholder='IBAN' />
              <input className='w-full border rounded-xl p-3' value={supplier.bank} onChange={(e)=>setSupplier({...supplier, bank:e.target.value})} placeholder='Банк' />
              <select className='w-full border rounded-xl p-3' value={supplier.taxSystem} onChange={(e)=>setSupplier({...supplier, taxSystem:e.target.value})}>
                {TAX_SYSTEMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow p-6'>
            <h2 className='text-xl font-semibold mb-4'>База клієнтів</h2>
            <div className='space-y-2'>
              <input className='w-full border rounded-xl p-3' placeholder='Ім'я клієнта' value={newClient.name} onChange={(e)=>setNewClient({...newClient, name:e.target.value})} />
              <input className='w-full border rounded-xl p-3' placeholder='Телефон' value={newClient.phone} onChange={(e)=>setNewClient({...newClient, phone:e.target.value})} />
              <input className='w-full border rounded-xl p-3' placeholder='Адреса' value={newClient.address} onChange={(e)=>setNewClient({...newClient, address:e.target.value})} />
              <button onClick={addClient} className='w-full border rounded-xl p-3'>Додати клієнта</button>
              <select className='w-full border rounded-xl p-3' value={selectedClientId} onChange={(e)=>setSelectedClientId(e.target.value)}>
                <option value=''>Оберіть клієнта</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow p-6'>
            <h2 className='text-xl font-semibold mb-4'>База матеріалів</h2>
            <div className='space-y-2'>
              <input className='w-full border rounded-xl p-3' placeholder='Назва матеріалу' value={newMaterial.name} onChange={(e)=>setNewMaterial({...newMaterial, name:e.target.value})} />
              <input className='w-full border rounded-xl p-3' placeholder='Одиниця' value={newMaterial.unit} onChange={(e)=>setNewMaterial({...newMaterial, unit:e.target.value})} />
              <input className='w-full border rounded-xl p-3' type='number' placeholder='Ціна' value={newMaterial.price} onChange={(e)=>setNewMaterial({...newMaterial, price:e.target.value})} />
              <button onClick={addMaterial} className='w-full border rounded-xl p-3'>Додати матеріал</button>
              <div className='max-h-32 overflow-auto space-y-1'>
                {materialsDb.map(m => <div key={m.id} className='text-sm border rounded p-2'>{m.name} — {m.price} грн/{m.unit}</div>)}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Кошторис</h2>
          <div className='grid md:grid-cols-4 gap-3'>
            <input className='border rounded-xl p-3' placeholder='Робота' value={workName} onChange={(e)=>setWorkName(e.target.value)} />
            <input className='border rounded-xl p-3' type='number' placeholder='Ціна' value={price} onChange={(e)=>setPrice(e.target.value)} />
            <input className='border rounded-xl p-3' type='number' placeholder='Кількість' value={quantity} onChange={(e)=>setQuantity(e.target.value)} />
            <input className='border rounded-xl p-3' type='number' placeholder='Матеріали' value={materialCost} onChange={(e)=>setMaterialCost(e.target.value)} />
          </div>
          <button onClick={addItem} className='mt-3 px-4 py-3 rounded-2xl shadow bg-black text-white'>Додати позицію</button>
          <div className='mt-4 space-y-2'>
            {items.map(i => <div key={i.id} className='border rounded-xl p-3'>{i.name} — {i.total} грн</div>)}
          </div>
          <div className='mt-4 font-bold'>Робота: {laborTotal} грн | Матеріали: {materialsTotal} грн | Разом: {grandTotal} грн</div>
          <button onClick={saveInvoice} className='mt-3 border rounded-xl px-4 py-2'>Зберегти рахунок</button>
          <div className='mt-4 grid md:grid-cols-3 gap-3'>
            <div className='border rounded-xl p-3'>Податок: {taxAmount} грн</div>
            <div className='border rounded-xl p-3'>До сплати: {totalWithTax} грн</div>
            <button onClick={() => window.print()} className='border rounded-xl p-3'>Друк рахунку / PDF</button>
          </div>
          <div className='mt-4 border rounded-2xl p-4 bg-gray-50'>
            <h3 className='font-semibold mb-2'>Рахунок для клієнта</h3>
            <div>Постачальник: {supplier.company}</div>
            <div>ЄДРПОУ/ІПН: {supplier.edrpou}</div>
            <div>IBAN: {supplier.iban}</div>
            <div>Система: {supplier.taxSystem}</div>
            <div className='mt-2 font-bold'>Сума до сплати: {totalWithTax} грн</div>
          </div>
        </div>
      </div>
    </div>
  )
}
