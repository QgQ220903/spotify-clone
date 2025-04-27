import React from 'react'

import { Search as IconSearch } from 'lucide-react';

const Search = ({ size }) => {

    return (
        <div className="input bg-white dark:bg-slate-900">
            <IconSearch
                size={size}
                className="text-slate-300"
            />
            <input
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
            />
        </div>
    )
}

export default Search
