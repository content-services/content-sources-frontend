import { Component, ReactNode } from 'react';
import axios from 'axios';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

class GlitchtipError extends Component<Props, State> {
    state: State = {
        hasError: false
    };

    static getDerivedStateFromError(): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        axios.post('/api/content-sources/v1.0/log_error/', {
            error_title: 'UI error',
            error_details: error.stack,
        })
        throw error
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback
        }

        return this.props.children;
    }
}

export default GlitchtipError;
