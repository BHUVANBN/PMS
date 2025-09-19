import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Bars3Icon, ChartBarIcon, ClipboardDocumentListIcon, HomeIcon, UsersIcon, ViewColumnsIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useAuth } from '../store/auth.js'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/projects', label: 'Projects', icon: ClipboardDocumentListIcon },
  { to: '/kanban', label: 'Kanban', icon: ViewColumnsIcon },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon }
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-900/50" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 items-center justify-between">
                    <div className="font-semibold">PMS</div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-2">
                      {navItems.map(({ to, label, icon: Icon }) => (
                        <li key={to}>
                          <NavLink to={to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `group flex gap-x-3 rounded-md p-2 text-sm leading-6 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <Icon className="h-6 w-6" />
                            {label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-100 bg-white px-6 pb-4">
          <div className="flex h-16 items-center font-semibold">PMS</div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => `group flex gap-x-3 rounded-md p-2 text-sm leading-6 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Icon className="h-6 w-6" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</div>
              <button onClick={handleLogout} className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
